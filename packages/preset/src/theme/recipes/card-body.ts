export const cardBody = {
  display: "flex",
  alignItems: "center",
  flex: "1",
  "&[data-indicator-placement=end]": {
    justifyContent: "flex-end",
  },
};

export const cardContent = {
  display: "flex",
  flexDirection: "column",
  gap: "1",
  flex: "1",
};

export const cardDescription = {
  color: "fg.muted",
};

export const cardAddon = {
  borderTopWidth: "1px",
  borderColor: "border",
};
