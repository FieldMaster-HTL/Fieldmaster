import { FARM_MUTATIONS, FARM_QUERIES } from "./farm.query";
import { USER_MUTATIONS, USER_QUERIES } from "./user.query";
import { AREA_MUTATIONS, AREA_QUERIES } from "./area.query";

export const QUERIES = {
  USER: USER_QUERIES,
  FARM: FARM_QUERIES,
  AREA: AREA_QUERIES,
};

export const MUTATIONS = {
  USER: USER_MUTATIONS,
  FARM: FARM_MUTATIONS,
  AREA: AREA_MUTATIONS,
};
