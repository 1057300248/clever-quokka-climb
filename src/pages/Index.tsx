import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-white">
          欢迎使用您的应用
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          我们已经为您准备好了基础功能，让我们开始构建您的项目吧！
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/price-comparator">前往1688比价工具</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;