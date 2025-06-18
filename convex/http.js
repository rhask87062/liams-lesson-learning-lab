import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/generateWavenetAudio",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { text } = await request.json();
    const result = await ctx.runAction(api.tts.generateWavenetAudio, { text });
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
  }),
});

export default http; 