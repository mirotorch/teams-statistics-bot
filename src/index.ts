import * as ACData from "adaptivecards-templating";
import express from "express";
import notificationTemplate from "./adaptiveCards/notification-default.json";
import { notificationApp } from "./internal/initialize";
import { TeamsBot } from "./teamsBot";
import { NotificationTargetType } from "@microsoft/teamsfx";

// Create express application.
const expressApp = express();
expressApp.use(express.json());

const server = expressApp.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nBot Started, ${expressApp.name} listening to`, server.address());
});

// Register an API endpoint with `express`.
//
// This endpoint is provided by your application to listen to events. You can configure
// your IT processes, other applications, background tasks, etc - to POST events to this
// endpoint.
//
// In response to events, this function sends Adaptive Cards to Teams. You can update the logic in this function
// to suit your needs. You can enrich the event with additional data and send an Adaptive Card as required.
//
// You can add authentication / authorization for this API. Refer to
// https://aka.ms/teamsfx-notification for more details.
expressApp.post("/api/notification", async (req, res) => {
  // By default this function will iterate all the installation points and send an Adaptive Card
  // to every installation.
  const pageSize = 100;
  let continuationToken: string | undefined = undefined;
  do {
    const pagedData = await notificationApp.notification.getPagedInstallations(
      pageSize,
      continuationToken
    );
    const installations = pagedData.data;
    continuationToken = pagedData.continuationToken;

    for (const target of installations) {
      if (target.type === NotificationTargetType.Channel) {
        await target.sendAdaptiveCard(
          new ACData.Template(notificationTemplate).expand({
            $root: {
              title: "New Event Occurred!",
              appName: "Contoso App Notification",
              description: `This is a sample http-triggered notification to ${target.type}`,
              notificationUrl: "https://aka.ms/teamsfx-notification-new",
            },
          })
        );
      }
    }
  } while (continuationToken);

  res.json({});
});


// Register an API endpoint with `express`. Teams sends messages to your application
// through this endpoint.
//
// The Teams Toolkit bot registration configures the bot with `/api/messages` as the
// Bot Framework endpoint. If you customize this route, update the Bot registration
// in `/templates/provision/bot.bicep`.
const teamsBot = new TeamsBot();
expressApp.post("/api/messages", async (req, res) => {
  await notificationApp.requestHandler(req, res, async (context) => {
    await teamsBot.run(context);
  });
});
