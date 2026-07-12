import axios from "axios";

/**
 * Searches the web for a query using Tavily API if available, or falls back to simulated search.
 */
export async function searchWeb(query: string, searchDepth: "basic" | "advanced" = "basic"): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (tavilyKey && tavilyKey.trim() !== "" && !tavilyKey.startsWith("YOUR_")) {
    try {
      console.log(`[Search Tool] Searching Tavily for: "${query}"`);
      const response = await axios.post("https://api.tavily.com/search", {
        api_key: tavilyKey,
        query,
        search_depth: searchDepth,
        include_answer: true,
        max_results: 5
      });

      if (response.data && response.data.results) {
        const resultsText = response.data.results
          .map((r: any) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}\n---`)
          .join("\n");
        return `Tavily Search Answer: ${response.data.answer || ""}\n\nSearch Results:\n${resultsText}`;
      }
    } catch (error: any) {
      console.error("[Search Tool] Tavily Search failed, falling back to simulation:", error.message || error);
    }
  }

  // Fallback / Simulation
  console.log(`[Search Tool] Simulated search for: "${query}"`);
  return `Simulated search results for: "${query}"
- Major recent developments and analysis.
- Market capitalization trends, products, and competitive landscape.
- Key strengths (robust balance sheet, strong brand, R&D pipeline).
- Key challenges (regulatory pressures, supply chain complexity, margin pressures).
- Sentiment is generally positive but cautious regarding macroeconomic factors.`;
}

/**
 * Fetches recent news articles for a company.
 */
export async function getCompanyNews(companyName: string): Promise<any[]> {
  const newsApiKey = process.env.NEWS_API_KEY;
  const gnewsApiKey = process.env.GNEWS_API_KEY;
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  // Let's try to query a real news endpoint if keys exist
  if (newsApiKey && !newsApiKey.startsWith("YOUR_")) {
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&sortBy=publishedAt&pageSize=5&apiKey=${newsApiKey}`);
      if (response.data && response.data.articles) {
        return response.data.articles.map((art: any) => ({
          title: art.title,
          source: art.source?.name || "NewsAPI",
          url: art.url,
          publishedAt: art.publishedAt,
          description: art.description || art.content || ""
        }));
      }
    } catch (e) {
      console.warn("[Search Tool] NewsAPI failed:", e);
    }
  }

  if (gnewsApiKey && !gnewsApiKey.startsWith("YOUR_")) {
    try {
      const response = await axios.get(`https://gnews.io/api/v4/search?q=${encodeURIComponent(companyName)}&lang=en&max=5&apikey=${gnewsApiKey}`);
      if (response.data && response.data.articles) {
        return response.data.articles.map((art: any) => ({
          title: art.title,
          source: art.source?.name || "GNews",
          url: art.url,
          publishedAt: art.publishedAt,
          description: art.description || art.content || ""
        }));
      }
    } catch (e) {
      console.warn("[Search Tool] GNews failed:", e);
    }
  }

  // Finnhub fallback for stock news
  if (finnhubApiKey && !finnhubApiKey.startsWith("YOUR_")) {
    try {
      // Finnhub needs a ticker, let's search it
      const response = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${finnhubApiKey}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data.slice(0, 5).map((art: any) => ({
          title: art.headline,
          source: art.source || "Finnhub",
          url: art.url,
          publishedAt: new Date(art.datetime * 1000).toISOString(),
          description: art.summary || ""
        }));
      }
    } catch (e) {
      console.warn("[Search Tool] Finnhub news failed:", e);
    }
  }

  // Fallback to Tavily News Search if Tavily key is present
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey && !tavilyKey.startsWith("YOUR_")) {
    try {
      const response = await axios.post("https://api.tavily.com/search", {
        api_key: tavilyKey,
        query: `${companyName} stock company news`,
        search_depth: "basic",
        max_results: 5
      });
      if (response.data && response.data.results) {
        return response.data.results.map((r: any) => ({
          title: r.title,
          source: "Tavily Search",
          url: r.url,
          publishedAt: new Date().toISOString(),
          description: r.content
        }));
      }
    } catch (e) {
      console.warn("[Search Tool] Tavily news search failed:", e);
    }
  }

  // Default Mock News
  console.log(`[Search Tool] Generating mock news for ${companyName}`);
  const date = new Date();
  return [
    {
      title: `${companyName} Expands Market Operations following Strong Quarterly Growth`,
      source: "Financial Times (Simulated)",
      url: "https://example.com/news/1",
      publishedAt: new Date(date.getTime() - 3600000 * 2).toISOString(),
      description: `Analysts upgrade ${companyName} rating after stellar quarterly results, noting increased market share and resilience in margins.`
    },
    {
      title: `How ${companyName} is Navigating Supply Chain Headwinds and Inflation`,
      source: "Reuters (Simulated)",
      url: "https://example.com/news/2",
      publishedAt: new Date(date.getTime() - 3600000 * 24).toISOString(),
      description: `The company's CEO outlines strategic investments in localizing production lines and expanding inventory safeguards.`
    },
    {
      title: `Tech Innovator ${companyName} Announces Next-Gen Product Line with AI Integration`,
      source: "TechCrunch (Simulated)",
      url: "https://example.com/news/3",
      publishedAt: new Date(date.getTime() - 3600000 * 48).toISOString(),
      description: `In a surprise announcement, the company showcases its new software suite driven by core LLM agentic modules.`
    },
    {
      title: `Competitors Struggle to Match ${companyName}'s Capital Expenditure and R&D Scale`,
      source: "Bloomberg (Simulated)",
      url: "https://example.com/news/4",
      publishedAt: new Date(date.getTime() - 3600000 * 72).toISOString(),
      description: `Research analysts report a growing moat for the company as competitors scale back capital investments.`
    },
    {
      title: `Regulatory Watch: ${companyName} Faces Compliance Check in European Markets`,
      source: "Wall Street Journal (Simulated)",
      url: "https://example.com/news/5",
      publishedAt: new Date(date.getTime() - 3600000 * 120).toISOString(),
      description: `Regulatory bodies confirm investigation into antitrust concerns regarding the company's regional platforms.`
    }
  ];
}
