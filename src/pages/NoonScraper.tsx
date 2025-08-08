import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

// 为抓取的商品定义数据结构
type NoonProduct = {
  monthlySalesVolume: number | string;
  monthlySalesValue: number | string;
  brandLink: string;
  sellerLink: string;
  specifications: Record<string, string>;
};

const NoonScraper = () => {
  const [productUrl, setProductUrl] = useState("");
  const [productData, setProductData] = useState<NoonProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async () => {
    if (!productUrl.includes("noon.com")) {
      showError("请输入一个有效的 Noon 商品链接");
      return;
    }
    setIsLoading(true);
    setProductData(null);
    const toastId = showLoading("正在抓取商品数据...");

    try {
      const { data, error } = await supabase.functions.invoke('noon-scraper', {
        body: { productUrl },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      setProductData(data);
      dismissToast(toastId);
      showSuccess("商品数据抓取成功！");
    } catch (err: any) {
      dismissToast(toastId);
      showError(`抓取失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!productData) {
      showError("没有可导出的数据。");
      return;
    }

    const specs = Object.entries(productData.specifications)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const dataToExport = [
      {
        "月销售量": productData.monthlySalesVolume,
        "月销售额": productData.monthlySalesValue,
        "品牌链接": productData.brandLink,
        "商家链接": productData.sellerLink,
        "参数规格": specs,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Noon Product Data");

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 40 },
      { wch: 40 },
      { wch: 50 },
    ];

    XLSX.writeFile(workbook, "noon_product_data.xlsx");
    showSuccess("数据已成功导出为 Excel 文件！");
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Noon 商品数据抓取工具</CardTitle>
          <CardDescription>
            输入一个 Noon 商品链接，自动抓取月销量、销售额、品牌、商家和规格参数。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="url"
              placeholder="请在此处粘贴 Noon 商品链接"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleScrape} disabled={isLoading}>
              {isLoading ? "抓取中..." : "开始抓取"}
            </Button>
          </div>

          {productData && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">抓取结果</h3>
                <Button onClick={handleExport} variant="outline">
                  导出为 Excel
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>销售数据</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>月销售量:</strong> {productData.monthlySalesVolume}</p>
                    <p><strong>月销售额:</strong> {productData.monthlySalesValue}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>链接信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>品牌:</strong> <a href={productData.brandLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">访问链接</a></p>
                    <p><strong>商家:</strong> <a href={productData.sellerLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">访问链接</a></p>
                  </CardContent>
                </Card>
              </div>

              <h4 className="text-md font-semibold mb-2">参数规格</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>参数</TableHead>
                    <TableHead>值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(productData.specifications).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            数据抓取功能已连接后端服务。如果抓取失败，可能是 Noon 网站结构已更新。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoonScraper;