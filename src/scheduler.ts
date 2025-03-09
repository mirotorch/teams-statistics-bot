import * as ACData from "adaptivecards-templating";
import notificationTemplate from "./adaptiveCards/notification-default.json";
import { notificationApp } from "./internal/initialize";
import { NotificationTargetType } from "@microsoft/teamsfx";
import { CronJob } from 'cron';


// Schedule a cron job to send notifications every minute.
export const notificationJob = new CronJob('0 * * * * *', async () => {
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
                description: `This is a sample timer-triggered notification to ${target.type}`,
                notificationUrl: "https://aka.ms/teamsfx-notification-new",
                },
            })
            );
        }
        }
    } while (continuationToken);
}, null, false, 'UTC');