import CircularProgress from "@mui/material/CircularProgress";

const CircleLoader = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <CircularProgress size={20} />
    </div>
  );
};

export default CircleLoader;
