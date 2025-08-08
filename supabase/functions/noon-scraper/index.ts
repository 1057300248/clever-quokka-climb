import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productUrl } = await req.json();

    if (!productUrl || !productUrl.includes("noon.com")) {
      throw new Error("需要一个有效的 Noon 商品链接。");
    }

    // 1. 获取页面
    const response = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) {
      throw new Error(`获取页面失败，状态: ${response.status} ${response.statusText}`);
    }

    // 2. 解析HTML
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
        throw new Error("解析 HTML 文档失败。");
    }
    
    // 检查是否被机器人检测拦截
    const pageTitle = doc.querySelector('title')?.textContent;
    if (pageTitle && /robot|captcha|human/i.test(pageTitle)) {
      throw new Error("抓取失败：被机器人检测系统拦截。");
    }

    // 3. 提取数据
    let monthlySalesVolume, brandLink, sellerLink;
    const specifications: Record<string, string> = {};

    try {
      const salesVolumeElement = Array.from(doc.querySelectorAll('span, div')).find(el => (el as Element).textContent.includes('sold in the last month'));
      monthlySalesVolume = salesVolumeElement ? (salesVolumeElement as Element).textContent.trim() : "未找到";

      const brandLinkElement = doc.querySelector('a[data-qa-id="brand-name-pdp"]');
      brandLink = brandLinkElement ? `https://www.noon.com${brandLinkElement.getAttribute('href')}` : "未找到";

      const sellerLinkElement = doc.querySelector('a[data-qa-id="seller-name-pdp"]');
      sellerLink = sellerLinkElement ? `https://www.noon.com${sellerLinkElement.getAttribute('href')}` : "未找到";

      const specContainer = doc.querySelector('div[data-qa-id="specifications-pdp"]');
      if (specContainer) {
        const specRows = specContainer.querySelectorAll('div');
         for (let i = 0; i < specRows.length; i += 2) {
          const keyElement = specRows[i];
          const valueElement = specRows[i + 1];
          if (keyElement && valueElement) {
            const key = (keyElement as Element).textContent.trim();
            const value = (valueElement as Element).textContent.trim();
            if (key && value) {
              specifications[key] = value;
            }
          }
        }
      }
    } catch (e: any) {
      throw new Error(`提取数据时出错: ${e.message}`);
    }

    const data = {
      monthlySalesVolume,
      monthlySalesValue: "不可用",
      brandLink,
      sellerLink,
      specifications,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Scraping error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});