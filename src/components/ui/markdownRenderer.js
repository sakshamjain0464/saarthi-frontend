import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkDownRenderer = ({ message }) => {
    return (

        <ReactMarkdown remarkPlugins={[remarkGfm]} className={"leading-loose"}>{message}</ReactMarkdown>
    );
};

export default MarkDownRenderer;
