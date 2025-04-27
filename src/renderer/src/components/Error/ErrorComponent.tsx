import { Link } from "@tanstack/react-router";

type ErrorComponentProps = {
   error: any;
};
export function ErrorComponent(props: ErrorComponentProps) {
   console.log(props.error, "props");
   return (
      <div className="w-full h-screen center">
         <div className="border border-zinc-600 rounded-md p-5 center flex-col gap-3">
            <h1 className="text-[25px] text-red-500">
               Oops something went wrong !
            </h1>
            <Link
               to="/"
               className="border border-gray-700 p-2 px-5 rounded-md bg-gray-700 hover:bg-gray-800 font-bold text-gray-300"
            >
               Go back to home page
            </Link>
         </div>
      </div>
   );
}
