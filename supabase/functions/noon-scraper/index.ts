import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { DOMParser, Element } from "https://esm.sh/deno-dom@0.1.45";

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
      return new Response(JSON.stringify({ error: "需要一个有效的 Noon 商品链接。" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const response = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`抓取页面失败: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
        throw new Error("解析 HTML 文档失败。");
    }

    // --- 数据提取逻辑 ---
    // 注意：这些选择器基于电商网站的通用结构，可能需要根据 Noon 的具体布局进行调整。

    const salesVolumeElement = Array.from(doc.querySelectorAll('span, div')).find(el => (el as Element).textContent.includes('sold in the last month'));
    const monthlySalesVolume = salesVolumeElement ? (salesVolumeElement as Element).textContent.trim() : "未找到";

    const monthlySalesValue = "不可用";

    const brandLinkElement = doc.querySelector('a[data-qa-id="brand-name-pdp"]');
    const brandLink = brandLinkElement ? `https://www.noon.com${brandLinkElement.getAttribute('href')}` : "未找到";

    const sellerLinkElement = doc.querySelector('a[data-qa-id="seller-name-pdp"]');
    const sellerLink = sellerLinkElement ? `https://www.noon.com${sellerLinkElement.getAttribute('href')}` : "未找到";

    const specifications: Record<string, string> = {};
    const specRows = doc.querySelectorAll('div[data-qa-id="specifications-pdp"] > div');
    
    if (specRows) {
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

    const data = {
      monthlySalesVolume,
      monthlySalesValue,
      brandLink,
      sellerLink,
      specifications,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});