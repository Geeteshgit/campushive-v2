import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";

import type {
  CarpoolPagination,
  CreateCarpoolInput,
  RequestDecision,
  RequestStatus,
  UpdateCarpoolInput,
} from "./carpool.schema.js";

const userSummarySelect = {
  id: true,
  username: true,
} as const;

const carpoolInclude = {
  user: { select: userSummarySelect },
  members: { include: { user: { select: userSummarySelect } } },
  _count: {
    select: {
      members: true,
      requests: { where: { status: "PENDING" } },
    },
  },
} as const;

const syncExpiredCarpools = async () => {
  await prisma.carpool.updateMany({
    where: { status: "ACTIVE", departureTime: { lte: new Date() } },
    data: { status: "EXPIRED" },
  });
};

const requireActiveHostCarpool = async (carpoolId: string, userId: string) => {
  await syncExpiredCarpools();
  const carpool = await prisma.carpool.findUnique({
    where: { id: carpoolId },
    include: { _count: { select: { members: true } } },
  });

  if (!carpool) throw new AppError("Carpool not found", 404);
  if (carpool.userId !== userId) {
    throw new AppError("Only the carpool host can perform this action", 403);
  }
  if (carpool.status !== "ACTIVE") {
    throw new AppError("Only active carpools can be changed", 400);
  }

  return carpool;
};

export const createCarpool = async (userId: string, data: CreateCarpoolInput) =>
  prisma.carpool.create({
    data: {
      userId,
      pickupPoint: data.pickupPoint,
      destinationPoint: data.destinationPoint,
      departureTime: data.departureTime,
      requiredPeople: data.requiredPeople,
      members: { create: { userId } },
    },
    include: carpoolInclude,
  });

export const getCarpools = async ({
  page,
  limit,
  status,
}: CarpoolPagination) => {
  await syncExpiredCarpools();
  const statusMap = {
    active: "ACTIVE",
    expired: "EXPIRED",
    cancelled: "CANCELLED",
  } as const;
  const where = status === "all" ? {} : { status: statusMap[status] };
  const [carpools, total] = await Promise.all([
    prisma.carpool.findMany({
      where,
      include: carpoolInclude,
      orderBy: { departureTime: status === "expired" ? "desc" : "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.carpool.count({ where }),
  ]);

  return {
    carpools,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getCarpoolById = async (carpoolId: string) => {
  await syncExpiredCarpools();
  const carpool = await prisma.carpool.findUnique({
    where: { id: carpoolId },
    include: carpoolInclude,
  });
  if (!carpool) throw new AppError("Carpool not found", 404);
  return carpool;
};

export const updateCarpool = async (
  carpoolId: string,
  userId: string,
  data: UpdateCarpoolInput,
) => {
  const carpool = await requireActiveHostCarpool(carpoolId, userId);
  if (
    data.requiredPeople !== undefined &&
    data.requiredPeople < carpool._count.members
  ) {
    throw new AppError(
      `Required people cannot be less than ${carpool._count.members}`,
      400,
    );
  }

  return prisma.carpool.update({
    where: { id: carpoolId },
    data: {
      ...(data.pickupPoint !== undefined && { pickupPoint: data.pickupPoint }),
      ...(data.destinationPoint !== undefined && {
        destinationPoint: data.destinationPoint,
      }),
      ...(data.departureTime !== undefined && {
        departureTime: data.departureTime,
      }),
      ...(data.requiredPeople !== undefined && {
        requiredPeople: data.requiredPeople,
      }),
    },
    include: carpoolInclude,
  });
};

export const cancelCarpool = async (carpoolId: string, userId: string) => {
  await requireActiveHostCarpool(carpoolId, userId);
  return prisma.$transaction(async (tx) => {
    const carpool = await tx.carpool.update({
      where: { id: carpoolId },
      data: { status: "CANCELLED" },
      include: carpoolInclude,
    });
    await tx.carpoolRequest.updateMany({
      where: { carpoolId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    return carpool;
  });
};

export const requestToJoinCarpool = async (
  carpoolId: string,
  userId: string,
) => {
  await syncExpiredCarpools();
  const carpool = await prisma.carpool.findUnique({
    where: { id: carpoolId },
    include: { _count: { select: { members: true } } },
  });
  if (!carpool) throw new AppError("Carpool not found", 404);
  if (carpool.status !== "ACTIVE") {
    throw new AppError("Only active carpools can be joined", 400);
  }
  if (carpool.userId === userId) {
    throw new AppError("The host is already a member of this carpool", 400);
  }
  if (carpool._count.members >= carpool.requiredPeople) {
    throw new AppError("This carpool is full", 409);
  }

  const existing = await prisma.carpoolRequest.findUnique({
    where: { carpoolId_userId: { carpoolId, userId } },
  });
  if (existing?.status === "PENDING") {
    throw new AppError("A join request is already pending", 409);
  }
  if (existing?.status === "ACCEPTED") {
    throw new AppError("You are already a member of this carpool", 409);
  }

  return prisma.carpoolRequest.upsert({
    where: { carpoolId_userId: { carpoolId, userId } },
    create: { carpoolId, userId },
    update: { status: "PENDING" },
    include: { user: { select: userSummarySelect } },
  });
};

export const getCarpoolRequests = async (
  carpoolId: string,
  userId: string,
  status: RequestStatus,
) => {
  await requireActiveHostCarpool(carpoolId, userId);
  return prisma.carpoolRequest.findMany({
    where: { carpoolId, status },
    include: { user: { select: userSummarySelect } },
    orderBy: { createdAt: "asc" },
  });
};

export const decideCarpoolRequest = async (
  carpoolId: string,
  requestId: string,
  hostId: string,
  decision: RequestDecision,
) =>
  prisma.$transaction(
    async (tx) => {
      await tx.carpool.updateMany({
        where: {
          id: carpoolId,
          status: "ACTIVE",
          departureTime: { lte: new Date() },
        },
        data: { status: "EXPIRED" },
      });
      const carpool = await tx.carpool.findUnique({
        where: { id: carpoolId },
        include: { _count: { select: { members: true } } },
      });
      if (!carpool) throw new AppError("Carpool not found", 404);
      if (carpool.userId !== hostId) {
        throw new AppError("Only the carpool host can decide requests", 403);
      }
      if (carpool.status !== "ACTIVE") {
        throw new AppError("Only active carpools can be changed", 400);
      }

      const request = await tx.carpoolRequest.findFirst({
        where: { id: requestId, carpoolId },
      });
      if (!request) throw new AppError("Carpool request not found", 404);
      if (request.status !== "PENDING") {
        throw new AppError("Only pending requests can be decided", 409);
      }

      if (decision.action === "reject") {
        return tx.carpoolRequest.update({
          where: { id: requestId },
          data: { status: "REJECTED" },
          include: { user: { select: userSummarySelect } },
        });
      }

      if (carpool._count.members >= carpool.requiredPeople) {
        throw new AppError("This carpool is full", 409);
      }
      await tx.carpoolMember.create({
        data: { carpoolId: carpoolId, userId: request.userId },
      });
      return tx.carpoolRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
        include: { user: { select: userSummarySelect } },
      });
    },
    { isolationLevel: "Serializable" },
  );

export const removeCarpoolMember = async (
  carpoolId: string,
  hostId: string,
  memberUserId: string,
) => {
  const carpool = await requireActiveHostCarpool(carpoolId, hostId);
  if (memberUserId === carpool.userId) {
    throw new AppError("The host cannot be removed from the carpool", 400);
  }

  try {
    await prisma.$transaction([
      prisma.carpoolMember.delete({
        where: {
          carpoolId_userId: { carpoolId: carpoolId, userId: memberUserId },
        },
      }),
      prisma.carpoolRequest.update({
        where: { carpoolId_userId: { carpoolId, userId: memberUserId } },
        data: { status: "CANCELLED" },
      }),
    ]);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      throw new AppError("Carpool member not found", 404);
    }
    throw error;
  }
};
