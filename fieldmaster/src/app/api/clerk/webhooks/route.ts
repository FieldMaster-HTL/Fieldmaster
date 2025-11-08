import { MUTATIONS } from "@/src/server/db/queries/queries";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    if (eventType === "user.created") {
      await MUTATIONS.USER.createUser(
        evt.data.id.toString(),
        evt.data.first_name,
        evt.data.last_name,
      );
    } else if (eventType === "user.deleted") {
      if (!evt.data.id) throw Error("clerk id is null");
      await MUTATIONS.USER.deleteByClerkId(evt.data.id);
    } else if (eventType === "user.updated") {
      await MUTATIONS.USER.updateByClerkId(evt.data.id, {
        firstName: evt.data.first_name,
        lastName: evt.data.last_name,
      });
    } else if (eventType === "organization.created") {
      await MUTATIONS.FARM.createFarm(
        evt.data.id,
        evt.data.name,
        evt.data.slug,
        evt.data.created_by,
      );
    } else if (eventType === "organization.updated") {
      await MUTATIONS.FARM.updateFarmByClerkId(evt.data.id, {
        name: evt.data.name,
        slug: evt.data.slug,
      });
    } else if (eventType === "organization.deleted") {
      if (!evt.data.id) throw Error("clerk id is null");
      await MUTATIONS.FARM.deleteFarmByClerkId(evt.data.id);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook: " + err, { status: 400 });
  }
}
