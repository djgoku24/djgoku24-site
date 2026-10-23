export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/news") {
      try {
        const rssResponse = await fetch(
          "https://www.repubblica.it/rss/homepage/rss2.0.xml"
        );

        const xml = await rssResponse.text();

        const titles = [...xml.matchAll(
          /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/g
        )]
          .map(match => match[1].trim())
          .filter(title => title && title !== "Repubblica.it");

        return new Response(
          JSON.stringify({
            status: "ok",
            items: titles.slice(0, 12).map(title => ({ title }))
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=300"
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ status: "error", items: [] }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
