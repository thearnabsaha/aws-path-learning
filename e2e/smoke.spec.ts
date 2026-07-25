import { expect, test } from "@playwright/test";

test.describe("AWS Path smoke", () => {
  test.beforeEach(async ({ page }) => {
    // Skip first-run coach so it does not intercept clicks
    await page.addInitScript(() => {
      localStorage.setItem("aws-path-coach-v1", "done");
    });
  });

  test("home → lesson → accordion → quiz submit", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Learn AWS/i })
    ).toBeVisible();

    // Prefer curriculum card; scroll past 3D hero/arch so the link is clickable
    const card = page.locator("a.lesson-card[href='/lesson/cloud-fundamentals']").first();
    await expect(card).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    await card.click({ force: true });
    await expect(page).toHaveURL(/\/lesson\/cloud-fundamentals/, { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: /What is Cloud Computing/i })
    ).toBeVisible();

    const expand = page.getByRole("button", { name: /Expand all/i });
    await expect(expand).toBeVisible();
    await expand.click();

    await expect(page.locator("section.quiz")).toBeVisible();

    const option = page.locator(".quiz-option").first();
    if (await option.count()) {
      await option.click();
      const submit = page.getByRole("button", { name: /Submit quiz/i });
      await expect(submit).toBeEnabled();
      await submit.click();
      await expect(page.getByText(/Final score/i)).toBeVisible();
    }

    const complete = page.getByRole("button", { name: /Mark complete/i });
    if (await complete.isVisible()) {
      page.once("dialog", (d) => d.accept());
      await complete.click();
      await expect(
        page.getByRole("button", { name: /Undo complete/i })
      ).toBeVisible();
    }
  });

  test("path picker filters curriculum", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Fast path/i }).click();
    await expect(
      page.getByRole("heading", { name: /Fast path lessons/i })
    ).toBeVisible();
    await expect(
      page.locator(".lesson-card", { hasText: "AWS Lambda" })
    ).toHaveCount(0);
  });

  test("offline page renders", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByText(/You are offline/i)).toBeVisible();
    await expect(page.getByText(/Cached lessons/i)).toBeVisible();
  });
});
