const generateId = () => {
  return (
    "_e_" + Date.now() + (Math.random() * 365).toString(16).slice(4, 14) + "kc"
  );
};
