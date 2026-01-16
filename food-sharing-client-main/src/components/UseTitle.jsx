import { useEffect } from "react";

const UseTitle = (title) => {
  useEffect(() => {
    document.title = `ReServe | ${title}`;
  }, []);
  return <div></div>;
};

export default UseTitle;
