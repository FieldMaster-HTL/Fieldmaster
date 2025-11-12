import { db } from "@/src/server/db/index";
import { FARM_QUERIES, FARM_MUTATIONS } from "@/src/server/db/queries/farm.query";
import { USER_QUERIES } from "@/src/server/db/queries/user.query";
import { Farm } from "@/src/server/db/schema/schema";
import { eq } from "drizzle-orm";

// Mock Drizzle ORM and schema
jest.mock("@/src/server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

jest.mock("@/src/server/db/schema/schema", () => ({
  Farm: {
    id: "mockFarmId",
    clerkId: "mockFarmClerkId",
    name: "mockFarmName",
    slug: "mockFarmSlug",
    creatorId: "mockFarmCreatorId",
  },
}));

jest.mock("@/src/server/db/queries/user.query", () => ({
  USER_QUERIES: {
    mapClerkIdtoLocalId: jest.fn(),
  },
}));

describe("FARM_QUERIES", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("mapClerkIdToLocalId", () => {
    it("should return the local ID if a farm is found", async () => {
      (db.select as jest.Mock).mockReturnThis();
      (db.from as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.limit as jest.Mock).mockReturnThis();
      (db.then as jest.Mock).mockImplementation((callback) =>
        callback([{ id: "local_farm_id_123" }]),
      );
      (eq as jest.Mock).mockReturnValue("eq_condition");

      const result = await FARM_QUERIES.mapClerkIdToLocalId("clerk_farm_id_123");

      expect(db.select).toHaveBeenCalledWith({ id: Farm.id });
      expect(db.from).toHaveBeenCalledWith(Farm);
      expect(eq).toHaveBeenCalledWith(Farm.clerkId, "clerk_farm_id_123");
      expect(db.where).toHaveBeenCalledWith("eq_condition");
      expect(db.limit).toHaveBeenCalledWith(1);
      expect(result).toBe("local_farm_id_123");
    });

    it("should throw an error if no farm is found", async () => {
      (db.select as jest.Mock).mockReturnThis();
      (db.from as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.limit as jest.Mock).mockReturnThis();
      (db.then as jest.Mock).mockImplementation((callback) => callback([]));
      (eq as jest.Mock).mockReturnValue("eq_condition");

      await expect(FARM_QUERIES.mapClerkIdToLocalId("non_existent_clerk_id")).rejects.toThrow(
        "no Farm found for clerkId:[object Object]",
      );
    });
  });
});

describe("FARM_MUTATIONS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createFarm", () => {
    it("should create a new farm with a creator", async () => {
      (USER_QUERIES.mapClerkIdtoLocalId as jest.Mock).mockResolvedValue("local_creator_id_123");
      (db.insert as jest.Mock).mockReturnThis();
      (db.values as jest.Mock).mockResolvedValue([{ id: "new_farm_id" }]);

      await FARM_MUTATIONS.createFarm(
        "clerk_farm_id_abc",
        "Farm Name",
        "farm-slug",
        "clerk_creator_id_xyz",
      );

      expect(USER_QUERIES.mapClerkIdtoLocalId).toHaveBeenCalledWith("clerk_creator_id_xyz");
      expect(db.insert).toHaveBeenCalledWith(Farm);
      expect(db.values).toHaveBeenCalledWith({
        clerkId: "clerk_farm_id_abc",
        name: "Farm Name",
        slug: "farm-slug",
        creatorId: "local_creator_id_123",
      });
    });

    it("should create a new farm without a creator if created_by is not provided", async () => {
      (db.insert as jest.Mock).mockReturnThis();
      (db.values as jest.Mock).mockResolvedValue([{ id: "new_farm_id" }]);

      await FARM_MUTATIONS.createFarm("clerk_farm_id_abc", "Farm Name", "farm-slug");

      expect(USER_QUERIES.mapClerkIdtoLocalId).not.toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalledWith(Farm);
      expect(db.values).toHaveBeenCalledWith({
        clerkId: "clerk_farm_id_abc",
        name: "Farm Name",
        slug: "farm-slug",
        creatorId: null,
      });
    });

    it("should create a new farm without a creator if created_by lookup fails", async () => {
      (USER_QUERIES.mapClerkIdtoLocalId as jest.Mock).mockRejectedValue(
        new Error("Creator not found"),
      );
      (db.insert as jest.Mock).mockReturnThis();
      (db.values as jest.Mock).mockResolvedValue([{ id: "new_farm_id" }]);

      await FARM_MUTATIONS.createFarm(
        "clerk_farm_id_abc",
        "Farm Name",
        "farm-slug",
        "clerk_creator_id_xyz",
      );

      expect(USER_QUERIES.mapClerkIdtoLocalId).toHaveBeenCalledWith("clerk_creator_id_xyz");
      expect(db.insert).toHaveBeenCalledWith(Farm);
      expect(db.values).toHaveBeenCalledWith({
        clerkId: "clerk_farm_id_abc",
        name: "Farm Name",
        slug: "farm-slug",
        creatorId: null,
      });
    });
  });

  describe("updateFarm", () => {
    it("should update a farm", async () => {
      (db.update as jest.Mock).mockReturnThis();
      (db.set as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockResolvedValue([]);
      (eq as jest.Mock).mockReturnValue("eq_condition");

      await FARM_MUTATIONS.updateFarm("local_farm_id_123" as any, {
        name: "Updated Name",
        slug: "updated-slug",
      });

      expect(db.update).toHaveBeenCalledWith(Farm);
      expect(db.set).toHaveBeenCalledWith({ name: "Updated Name", slug: "updated-slug" });
      expect(eq).toHaveBeenCalledWith(Farm.id, "local_farm_id_123");
      expect(db.where).toHaveBeenCalledWith("eq_condition");
    });
  });

  describe("updateFarmByClerkId", () => {
    it("should update a farm by clerk ID", async () => {
      const mapClerkIdToLocalIdSpy = jest.spyOn(FARM_QUERIES, "mapClerkIdToLocalId");
      mapClerkIdToLocalIdSpy.mockResolvedValue("local_farm_id_123" as any);
      const updateFarmSpy = jest.spyOn(FARM_MUTATIONS, "updateFarm");
      updateFarmSpy.mockResolvedValue(undefined);

      await FARM_MUTATIONS.updateFarmByClerkId("clerk_farm_id_123", {
        name: "Updated Name",
        slug: "updated-slug",
      });

      expect(mapClerkIdToLocalIdSpy).toHaveBeenCalledWith("clerk_farm_id_123");
      expect(updateFarmSpy).toHaveBeenCalledWith("local_farm_id_123", {
        name: "Updated Name",
        slug: "updated-slug",
      });
    });
  });

  describe("deleteFarm", () => {
    it("should mark a farm as deleted", async () => {
      (db.update as jest.Mock).mockReturnThis();
      (db.set as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockResolvedValue([]);
      (eq as jest.Mock).mockReturnValue("eq_condition");

      const mockDate = new Date();

      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
      const dateSpy = jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
      await FARM_MUTATIONS.deleteFarm("local_farm_id_123" as any);
      expect(db.update).toHaveBeenCalledWith(Farm);
      expect(db.set).toHaveBeenCalledWith({ deletedAt: mockDate });
      expect(eq).toHaveBeenCalledWith(Farm.id, "local_farm_id_123");
      expect(db.where).toHaveBeenCalledWith("eq_condition");
      expect(db.where).toHaveBeenCalledWith("eq_condition");
      dateSpy.mockRestore();
    });
  });

  describe("deleteFarmByClerkId", () => {
    it("should delete a farm by clerk ID", async () => {
      const mapClerkIdToLocalIdSpy = jest.spyOn(FARM_QUERIES, "mapClerkIdToLocalId");
      mapClerkIdToLocalIdSpy.mockResolvedValue("local_farm_id_123" as any);
      const deleteFarmSpy = jest.spyOn(FARM_MUTATIONS, "deleteFarm");
      deleteFarmSpy.mockResolvedValue(undefined);

      await FARM_MUTATIONS.deleteFarmByClerkId("clerk_farm_id_123");

      expect(mapClerkIdToLocalIdSpy).toHaveBeenCalledWith("clerk_farm_id_123");
      expect(deleteFarmSpy).toHaveBeenCalledWith("local_farm_id_123");
    });
  });
});

