import { expect, test } from "@playwright/test";

test.describe("AWS Path smoke", () => {
  test("home → lesson → accordion → quiz submit", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Learn AWS/i })
    ).toBeVisible();

    // Prefer curriculum card (not sidebar) to avoid strict-mode double match
    await page.locator("a.lesson-card[href='/lesson/cloud-fundamentals']").click();
    await expect(page).toHaveURL(/\/lesson\/cloud-fundamentals/);
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
