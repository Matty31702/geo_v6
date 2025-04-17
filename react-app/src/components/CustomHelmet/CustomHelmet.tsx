import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";

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
      <title>{title}</title>
      {children}
    </Helmet>
  );
};

export default CustomHelmet;
