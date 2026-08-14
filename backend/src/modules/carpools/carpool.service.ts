import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import type { CreateCarpoolInput, UpdateCarpoolInput } from "./carpool.schema";

export const createCarpool = async (
  userId: string,
  data: CreateCarpoolInput,
) => {
  return prisma.carpool.create({
    data: {
      userId,
      pickupPoint: data.pickupPoint,
      destinationPoint: data.destinationPoint,
      departureTime: data.departureTime,
      maxMembers: data.maxMembers,
      members: {
        create: {
          userId,
        },
      },
    },

    include: {
      members: true,
    },
  });
};

export const getCarpools = async () => {
  return prisma.carpool.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePhotoUrl: true,
        },
      },

      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePhotoUrl: true,
            },
          },
        },
      },
    },

    orderBy: {
      departureTime: "asc",
    },
  });
};

export const getCarpoolById = async (carpoolId: string) => {
  return prisma.carpool.findUnique({
    where: {
      id: carpoolId,
    },

    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePhotoUrl: true,
        },
      },

      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePhotoUrl: true,
            },
          },
        },
      },
    },
  });
};

export const updateCarpool = async (
  carpoolId: string,
  userId: string,
  data: UpdateCarpoolInput,
) => {
  const carpool = await prisma.carpool.findUnique({
    where: {
      id: carpoolId,
    },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!carpool) {
    throw new AppError("Carpool not found", 404);
  }

  if (carpool.userId !== userId) {
    throw new AppError("You are not the host of this carpool", 403);
  }

  if (
    data.maxMembers !== undefined &&
    data.maxMembers < carpool._count.members
  ) {
    throw new AppError(
      `Maximum members cannot be less than ${carpool._count.members}`,
      400,
    );
  }

  const updateData = {
    ...(data.pickupPoint !== undefined && {
      pickupPoint: data.pickupPoint,
    }),

    ...(data.destinationPoint !== undefined && {
      destinationPoint: data.destinationPoint,
    }),

    ...(data.departureTime !== undefined && {
      departureTime: data.departureTime,
    }),

    ...(data.maxMembers !== undefined && {
      maxMembers: data.maxMembers,
    }),
  };

  return prisma.carpool.update({
    where: {
      id: carpoolId,
    },
    data: updateData,
  });
};

export const deleteCarpool = async (carpoolId: string, userId: string) => {
  const carpool = await prisma.carpool.findUnique({
    where: {
      id: carpoolId,
    },
  });

  if (!carpool) {
    throw new AppError("Carpool not found", 404);
  }

  if (carpool.userId !== userId) {
    throw new AppError("You are not the host of this carpool", 403);
  }

  return prisma.carpool.delete({
    where: {
      id: carpoolId,
    },
  });
};
