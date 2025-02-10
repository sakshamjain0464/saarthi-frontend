import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkDownRenderer = ({ message, ref }) => {
    return (

        <ReactMarkdown remarkPlugins={[remarkGfm]} className={"leading-loose"} ref={ref}>{message}</ReactMarkdown>
    );
};

export default MarkDownRenderer;
