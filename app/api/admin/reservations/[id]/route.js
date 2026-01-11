import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

// PUT update reservation
export async function PUT(request, { params }) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      checkIn,
      checkOut,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      clientCuit,
      totalAmount,
      paidAmount,
      deposit,
      status,
      notes,
    } = body;

    // Validate date range
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkOutDate <= checkInDate) {
        return NextResponse.json(
          { error: "Check-out date must be after check-in date" },
          { status: 400 }
        );
      }
    }

    // Get old reservation to clear old dates
    const oldReservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!oldReservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Clear old dates (set to disponible if no other reservation overlaps)
    const oldDates = [];
    const oldStart = new Date(oldReservation.checkIn);
    const oldEnd = new Date(oldReservation.checkOut);

    for (let d = new Date(oldStart); d < oldEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      oldDates.push(dateStr);
    }

    for (const date of oldDates) {
      // Check if there's another reservation on this date
      const otherReservations = await prisma.reservation.count({
        where: {
          id: { not: id },
          checkIn: { lte: new Date(date) },
          checkOut: { gt: new Date(date) },
          status: { not: "cancelado" },
        },
      });

      if (otherReservations === 0) {
        await prisma.day.updateMany({
          where: { date },
          data: { status: "available" },
        });
      }
    }

    // Use transaction to ensure data consistency
    const reservation = await prisma.$transaction(async (tx) => {
      // Update or create client first
      const client = await tx.client.upsert({
        where: { email: clientEmail },
        update: {
          name: clientName,
          phone: clientPhone,
          address: clientAddress || null,
          cuit: clientCuit || null,
        },
        create: {
          email: clientEmail,
          name: clientName,
          phone: clientPhone,
          address: clientAddress || null,
          cuit: clientCuit || null,
        },
      });

      // Update reservation
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: {
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          clientName,
          clientEmail,
          clientPhone,
          totalAmount: parseInt(totalAmount),
          paidAmount: parseInt(paidAmount),
          deposit: parseInt(deposit) || 60000,
          status,
          notes: notes || "",
          clientId: client.id,
        },
      });

      // Update calendar with new dates
      if (status !== "cancelado") {
        const newDates = [];
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          newDates.push(dateStr);
        }

        for (const date of newDates) {
          await tx.day.upsert({
            where: { date },
            update: { status: "reserved" },
            create: { date, status: "reserved" },
          });
        }
      }

      return updatedReservation;
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Error updating reservation:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Conflict: Reservation data conflicts with existing record" },
        { status: 409 }
      );
    }

    if (error.name === "PrismaClientValidationError") {
      return NextResponse.json(
        { error: "Invalid reservation data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update reservation. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE reservation
export async function DELETE(request, { params }) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Clear calendar dates
    const dates = [];
    const start = new Date(reservation.checkIn);
    const end = new Date(reservation.checkOut);

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      dates.push(dateStr);
    }

    for (const date of dates) {
      // Check if there's another reservation on this date
      const otherReservations = await prisma.reservation.count({
        where: {
          id: { not: id },
          checkIn: { lte: new Date(date) },
          checkOut: { gt: new Date(date) },
          status: { not: "cancelado" },
        },
      });

      if (otherReservations === 0) {
        await prisma.day.updateMany({
          where: { date },
          data: { status: "available" },
        });
      }
    }

    // Delete reservation
    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reservation:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete reservation. Please try again." },
      { status: 500 }
    );
  }
}
