window.addEventListener('load', () => {
  const MerkleTree = window.MerkleTree;

  document.addEventListener('click', async event => {
    if (ancestorWithClassName(event.target, 'all-content-middle-send-results-button')) {
      if (!Account || !Contract || !User) return;

      const state_result = document.getElementById('state-result').value;
      const opposition_result = document.getElementById('opposition-result').value;

      if (isNaN(parseInt(state_result)) || isNaN(parseInt(opposition_result)))
        return throwError('Please enter valid numbers.');

      loadAuditors(async auditors => {
        const leaves = auditors.state
          .map(auditor => {
            return keccak256([
              auditor.public_key,
              auditor.name,
              auditor.proof_of_identity,
              auditor.ballot_box_number,
              false,
            ]);
          })
          .concat(
            auditors.opposition.map(auditor => {
              return keccak256([
                auditor.public_key,
                auditor.name,
                auditor.proof_of_identity,
                auditor.ballot_box_number,
                true,
              ]);
            })
          );

        const node = keccak256([
          User.public_key,
          User.name,
          User.proof_of_identity,
          User.ballot_box_number,
          User.side
        ]);
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const proof = merkleTree.getHexProof(node);

        try {
          const receipt = await Contract
            .methods
            .validateBallotBox(
              User.name,
              User.proof_of_identity,
              User.ballot_box_number,
              User.side ? true : false,
              parseInt(state_result),
              parseInt(opposition_result),
              proof
            )
            .send({
              from: Account,
              gas: 1000000,
              gasPrice: 10000000000
            });

          console.log('Transaction Hash: ' + receipt.transactionHash);

          serverRequest('/data', 'POST', {
            ballot_box_number: User.ballot_box_number,
            state_vote_count: parseInt(state_result),
            opposition_vote_count: parseInt(opposition_result)
          }, res => {
            if (res.error)
              return throwError(res.error);

            createConfirm({
              title: 'Your registration was successful.',
              text: 'Thank you for participating on having a more decentralized and transparent election.',
              accept: 'Close'
            }, _ => {
              document.querySelector('.all-content-middle-send-results-button').style.display = 'none';
            });
          })
        } catch (err) {
          console.log(err)
        }
      });
    }
  });
});