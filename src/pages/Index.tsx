import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUser } from "@/lib/storage";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = getLoggedInUser();
    if (user.isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <Landing />;
};

export default Index;
