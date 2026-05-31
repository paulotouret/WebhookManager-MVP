
ALTER TABLE "endpoints" DROP CONSTRAINT "endpoints_projectId_fkey";


ALTER TABLE "events" DROP CONSTRAINT "events_endpointId_fkey";


ALTER TABLE "projects" DROP CONSTRAINT "projects_userId_fkey";


ALTER TABLE "replays" DROP CONSTRAINT "replays_eventId_fkey";


ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "events" ADD CONSTRAINT "events_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "replays" ADD CONSTRAINT "replays_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
