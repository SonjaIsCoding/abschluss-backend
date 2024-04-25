app.get("/", async (req, res) => {
  await connect();
  const content = await Content.find();

  if (!content.length) {
    return res.json({ message: "content not found" });
  }

  return res.json(content);
});
