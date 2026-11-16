import { useCallback, useEffect, useState } from "react";
import { getDisplayError } from "../utils/formatters.js";

export const useResource = (loader) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [settledVersion, setSettledVersion] = useState(-1);

  const reload = useCallback(() => setRequestVersion((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    loader()
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(getDisplayError(requestError, "Could not load this information."));
      })
      .finally(() => {
        if (active) setSettledVersion(requestVersion);
      });

    return () => { active = false; };
  }, [loader, requestVersion]);

  return { data, setData, loading: settledVersion !== requestVersion, error, reload };
};

export default useResource;
