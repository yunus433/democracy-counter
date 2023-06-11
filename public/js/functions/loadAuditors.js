const STATE_API = "/api/state";
const OPOSITION_API = "/api/opposition";

function loadAuditors (callback) {
  serverRequest(STATE_API, 'GET', {}, res => {
    if (res.error) return throwError(res.error);

    const stateAuditors = res;

    serverRequest(STATE_API, 'GET', {}, res => {
      if (res.error) return throwError(res.error);

      const oppositionAuditors = res;

      return callback({
        state: stateAuditors,
        opposition: oppositionAuditors
      });
    });
  });
};