import type { AxiosInstance } from "axios";
import axios from "axios";

const ENV_KEY = "4KMtED5G5y4JyB5H485CSM";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://edge.api.flagsmith.com/api/v1",
  headers: {
    "x-environment-key": ENV_KEY,
    "Access-Control-Allow-Origin": "*",
  },
});

export default class FeatureFlagApi {
  static getFeatureFlags(identity: string) {
    const url = `/identities/?identifier=${identity}`;
    return axiosInstance.get(url);
  }

  static joinBetaChannel(identity = "hetu@appsmith.com") {
    const url = `/traits`;
    return axiosInstance.post(url, {
      identity: {
        identifier: identity,
      },
      trait_key: "beta_user",
      trait_value: true,
    });
  }
}
