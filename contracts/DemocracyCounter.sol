//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract DemocracyCounter {
  struct BallotId {
    uint32 ballot_number;
    uint32 state_vote_count;
    uint32 opposition_vote_count;
  }

  struct BallotBox {
    bool exists;
    uint32 ballot_number;
    uint32 state_vote_count;
    uint32 opposition_vote_count;
    uint32 state_validator_count;
    uint32 opposition_validator_count;
  }

  bytes32 auditors_hash; // Merkle tree root for auditors
  mapping(uint128 => BallotBox) public ballotBoxes;

  event ValidateBallotBox(bool side, uint32 ballot_box_number, uint32 state_vote_count, uint32 opposition_vote_count, uint32 state_validator_count, uint32 opposition_validator_count);

  // IMPORTANT
  // This contract should normally to be deployed with the following constructor
  // As a proof of concept, we are deploying it with the second constructor to start with a pre-filled ballot_boxes mapping
  // If not, you should fill the ballot_boxes mapping with the createNewBallotBox function, with a different public key on each call

  constructor(
    bytes32 _auditors_hash
  ) {
    auditors_hash = _auditors_hash;
  }

  // constructor(
  //   bytes32 _auditors_hash,
  //   BallotBox[] memory ballot_boxes
  // ) {
  //   auditors_hash = _auditors_hash;

  //   for (uint32 i = 0; i < ballot_boxes.length; i++) {
  //     BallotBox memory ballot_box = ballot_boxes[i];

  //     uint128 id = this.ballotIdToUint128(
  //       BallotId(
  //         ballot_box.ballot_number,
  //         ballot_box.state_vote_count,
  //         ballot_box.opposition_vote_count
  //       )
  //     );

  //     ballotBoxes[id] = ballot_box;
  //   }
  // }

  function ballotIdToUint128(
    BallotId calldata ballot_id
  ) public pure returns (uint128) {
    return
      uint128(ballot_id.ballot_number) * uint128(1e20) +
      uint128(ballot_id.state_vote_count) * uint128(1e10) +
      uint128(ballot_id.opposition_vote_count);
  }

  function uint128ToBallotId(
    uint128 ballot_id_hash
  ) public pure returns (BallotId memory) {
    return
      BallotId({
        ballot_number: uint32(ballot_id_hash / 1e20),
        state_vote_count: uint32(ballot_id_hash / 1e10 % 1e10),
        opposition_vote_count: uint32(ballot_id_hash % 1e10)
      });
  }

  function getAuditorsHash() public view returns (bytes32) {
    return auditors_hash;
  }

  function getBallotBoxById(
    uint128 id
  ) public view returns (BallotBox memory) {
    return ballotBoxes[id];
  }

  function createNewBallotBox(
    uint32 ballot_number,
    uint32 state_vote_count,
    uint32 opposition_vote_count
  ) public {
    uint128 id = this.ballotIdToUint128(
      BallotId(
        ballot_number,
        state_vote_count,
        opposition_vote_count
      )
    );

    if (ballotBoxes[id].exists) return;

    ballotBoxes[id] = BallotBox({
      exists: true,
      ballot_number: ballot_number,
      state_vote_count: state_vote_count,
      opposition_vote_count: opposition_vote_count,
      state_validator_count: 0,
      opposition_validator_count: 0
    });
  }

  function validateBallotBox(
    string calldata name,
    string calldata proof_of_identity,
    uint32 ballot_box_number,
    bool side,
    uint32 state_vote_count,
    uint32 opposition_vote_count,
    bytes32[] calldata merkle_proof
  ) public {
    address public_key = msg.sender;

    bytes32 node = keccak256(
      abi.encodePacked(
        public_key,
        name,
        proof_of_identity,
        ballot_box_number,
        side
      )
    );

    bool isProofValid = MerkleProof.verify(
      merkle_proof,
      auditors_hash,
      node
    );

    require(isProofValid, "Error: Given information does not match merkle tree root on the contract.");

    uint128 id = this.ballotIdToUint128(
      BallotId(
        ballot_box_number,
        state_vote_count,
        opposition_vote_count
      )
    );

    if (!ballotBoxes[id].exists)
      this.createNewBallotBox(
        ballot_box_number,
        state_vote_count,
        opposition_vote_count
      );

    if (side) {
      ballotBoxes[id].state_validator_count++;
    } else {
      ballotBoxes[id].opposition_validator_count++;
    }

    emit ValidateBallotBox(
      side,
      ballot_box_number,
      state_vote_count,
      opposition_vote_count,
      ballotBoxes[id].state_validator_count,
      ballotBoxes[id].opposition_validator_count
    );
  }
}