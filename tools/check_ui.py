"""Browser test for the client."""

import sys
import asyncio
from playwright.async_api import async_playwright, expect

B="http://localhost:5173"
SH="shots/"

import os; os.makedirs(SH, exist_ok=True)

results=[]

def ok(name): results.append("PASS "+name)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width":1360,"height":860})
        pg = await ctx.new_page()
        errors=[]
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto(B+"/signin"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=SH+"new-signin.png")
        await pg.goto(B+"/signup"); await pg.wait_for_timeout(400)
        await pg.fill("#email","x@example.com"); await pg.fill("#password","abcdefghij1"); await pg.fill("#confirm","abcdefghij2")
        await pg.click("button[type=submit]")
        await expect(pg.get_by_role("alert")).to_have_text("The two passwords do not match."); ok("sign-up password mismatch caught in browser")
        await pg.fill("#email",""); await pg.fill("#password",""); await pg.fill("#confirm","")
        await pg.screenshot(path=SH+"new-signup.png")
        await pg.goto(B+"/signin"); await pg.fill("#email","demo@example.com"); await pg.fill("#password","demo-password-123")
        await pg.click("button[type=submit]"); await pg.wait_for_url(B+"/")
        await expect(pg.get_by_text("Profile completion")).to_be_visible(); ok("sign in opens dashboard")
        await pg.wait_for_timeout(500); await pg.screenshot(path=SH+"new-dashboard.png", full_page=True)
        await pg.goto(B+"/identity"); await expect(pg.get_by_text("Account details")).to_be_visible(); ok("identity page loads")
        await pg.wait_for_timeout(300); await pg.screenshot(path=SH+"new-identity.png", full_page=True)
        await pg.goto(B+"/personas/professional"); await expect(pg.get_by_text("Professional details")).to_be_visible()
        await pg.screenshot(path=SH+"new-professional.png", full_page=True)
        await pg.get_by_label("Edit Job title").click()
        await pg.fill("#attr-job_title","Senior Backend Developer"); await pg.get_by_role("button", name="Save").click()
        await expect(pg.get_by_role("status")).to_have_text("Saved."); await expect(pg.get_by_text("Senior Backend Developer")).to_be_visible(); ok("edit and save attribute (PATCH)")
        await pg.get_by_role("button", name="Add detail").click()
        await pg.select_option("#new-key","office_city"); await pg.fill("#new-value","London")
        await pg.screenshot(path=SH+"new-add-detail.png", full_page=True)
        await pg.get_by_role("button", name="Add detail").click()
        await expect(pg.get_by_role("status")).to_have_text("Added."); ok("add attribute")
        await pg.get_by_label("Edit Office city").click(); await pg.get_by_role("button", name="Remove", exact=True).click()
        await expect(pg.get_by_role("status")).to_have_text("Removed."); ok("remove attribute")
        await pg.get_by_role("button", name="Add name").click(); await pg.fill("#name-value","Ayesha K."); await pg.get_by_role("button", name="Add name").click()
        await expect(pg.get_by_role("status")).to_have_text("Name added."); ok("add name (POST)")
        await pg.get_by_label("Remove Ayesha K.").click(); await expect(pg.get_by_role("status")).to_have_text("Name removed."); ok("remove name (DELETE)")
        await pg.get_by_label("Edit Job title").click(); await pg.fill("#attr-job_title","Backend Developer"); await pg.get_by_role("button", name="Save").click()
        await expect(pg.get_by_role("status")).to_have_text("Saved.")
        await pg.get_by_role("navigation", name="Persona").get_by_role("link", name="Gaming").click()
        await expect(pg.get_by_text("Gaming details")).to_be_visible()
        await expect(pg.get_by_text("Ayesha Noor Khan")).to_have_count(0); ok("legal name hidden on gaming persona")
        await pg.wait_for_timeout(300); await pg.screenshot(path=SH+"new-gaming.png", full_page=True)
        await pg.goto(B+"/developer"); await pg.wait_for_timeout(500); await pg.screenshot(path=SH+"new-developer.png", full_page=True)
        await pg.goto(B+"/grants"); await expect(pg.get_by_text("Arcade Hub (demo)")).to_be_visible()
        await pg.screenshot(path=SH+"new-grants.png", full_page=True)
        await pg.get_by_role("button", name="Revoke Arcade Hub (demo)").click()
        await expect(pg.get_by_role("status")).to_contain_text("can no longer read"); ok("revoke grant (DELETE)")
        cid = sys.argv[1]
        await pg.goto(f"{B}/authorise?client_id={cid}&persona=gaming")
        await expect(pg.get_by_text("Allow access?")).to_be_visible(); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SH+"new-authorise.png")
        await pg.get_by_role("button", name="Allow").click(); await pg.wait_for_url(B+"/grants")
        await expect(pg.get_by_text("Arcade Hub (demo)")).to_be_visible(); ok("approve grant again (POST /consents)")
        await pg.reload(); await expect(pg.get_by_text("Active grants").first).to_be_visible()
        assert "/signin" not in pg.url; ok("reload keeps session (refresh cookie)")
        m = await b.new_context(viewport={"width":390,"height":844}); mp=await m.new_page()
        await mp.goto(B+"/signin"); await mp.fill("#email","demo@example.com"); await mp.fill("#password","demo-password-123")
        await mp.click("button[type=submit]"); await mp.wait_for_url(B+"/"); await mp.wait_for_timeout(600)
        await mp.screenshot(path=SH+"new-mobile.png")
        await mp.get_by_label("Open menu").click(); await mp.wait_for_timeout(200); await mp.screenshot(path=SH+"new-mobile-menu.png"); ok("mobile menu opens")
        await pg.get_by_role("button", name="Sign out").click(); await pg.wait_for_timeout(500)
        await pg.goto(B+"/"); await pg.wait_for_url("**/signin"); ok("sign out returns to sign-in")
        print("\n".join(results)); print("page errors:", errors)
        await b.close()

asyncio.run(main())