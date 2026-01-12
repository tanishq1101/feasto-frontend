import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/myorders");
  }, [navigate]);

  return null;
};

export default Verify;