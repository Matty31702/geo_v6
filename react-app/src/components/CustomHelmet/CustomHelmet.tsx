import { ReactNode } from "react";
import { Helmet } from "react-helmet";

interface CustomHelmetProps {
  title?: string;
  children?: ReactNode;
}

const CustomHelmet: React.FC<CustomHelmetProps> = ({
  title = "Geobound",
  children,
}) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
      {children}
    </Helmet>
  );
};

export default CustomHelmet;
