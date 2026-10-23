export async function onRequest() {
  const feed = "https://www.repubblica.it/rss/homepage/rss2.0.xml";

  try {
    const response = await fetch(feed);
    const xml = await response.text();

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
      JSON.stringify({
        status: "error",
        message: "Feed RSS temporaneamente non disponibile."
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
