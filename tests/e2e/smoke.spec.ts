import { expect, test } from "./fixtures";

// The pageIssues fixture also fails this test on console errors or failed requests.
test("home responds 200 with a valid document outline", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    /^[a-z]{2,3}(-[A-Za-z0-9]+)*$/,
  );
  await expect(page.locator("h1")).toHaveCount(1);
  expect((await page.title()).trim()).not.toBe("");
});
