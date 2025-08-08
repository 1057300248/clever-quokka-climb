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
import { showError } from "@/utils/toast";

// 这是一个模拟数据类型，之后会替换成真实数据
type Supplier = {
  name: string;
  price: number;
  url: string;
};

const PriceComparator = () => {
  const [productUrl, setProductUrl] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    // 这里是一些示例数据，让您先看看效果
    { name: "示例供应商A", price: 9.5, url: "#" },
    { name: "示例供应商B", price: 8.8, url: "#" },
    { name: "示例供应商C", price: 9.2, url: "#" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = () => {
    if (!productUrl.includes("1688.com")) {
      showError("请输入一个有效的1688商品链接");
      return;
    }
    // 这里的逻辑将在下一步集成后端服务时实现
    setIsLoading(true);
    console.log("开始比价: ", productUrl);
    // 模拟一个网络请求
    setTimeout(() => {
      // 在这里，我们之后会用真实数据更新 suppliers 状态
      // const sortedSuppliers = suppliers.sort((a, b) => a.price - b.price);
      // setSuppliers(sortedSuppliers);
      setIsLoading(false);
      showError("比价功能正在开发中，目前还不能获取真实数据。");
    }, 2000);
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => a.price - b.price);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>1688 同款商品比价工具</CardTitle>
          <CardDescription>
            输入一个1688商品链接，自动查找并对比不同供应商的价格，为您找到最低价。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="url"
              placeholder="请在此处粘贴1688商品链接"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleCompare} disabled={isLoading}>
              {isLoading ? "比价中..." : "开始比价"}
            </Button>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">比价结果</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>供应商名称</TableHead>
                  <TableHead className="text-right">价格 (元)</TableHead>
                  <TableHead>商品链接</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSuppliers.map((supplier, index) => (
                  <TableRow
                    key={index}
                    className={index === 0 ? "bg-green-100 dark:bg-green-900" : ""}
                  >
                    <TableCell className="font-medium">{supplier.name} {index === 0 && '(最低价)'}</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      ¥{supplier.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <a
                        href={supplier.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        访问店铺
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            价格数据仅供参考，请以供应商实际报价为准。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PriceComparator;