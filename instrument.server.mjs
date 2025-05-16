import * as Sentry from "@sentry/react-router";
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
    dsn: "https://8fc43df6ef4961f1e501d9c3172ab172@o4508213526790144.ingest.us.sentry.io/4508213528363008",

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    profilesSampleRate: 1.0, // profile every transaction
});
