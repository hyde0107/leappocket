import re

css_path = r"src\index.css"

with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

# Make it light scheme
css = css.replace("color-scheme: dark;", "color-scheme: light;")

# Top level vars
css = re.sub(r"--bg-deep:\s*#[0-9a-fA-F]+;", "--bg-deep: #f4f7fb;", css)
css = re.sub(r"--bg:\s*#[0-9a-fA-F]+;", "--bg: #ffffff;", css)
css = re.sub(r"--elevated:\s*#[0-9a-fA-F]+;", "--elevated: #eef2f6;", css)
css = re.sub(r"--surface:\s*rgba\([^)]+\);", "--surface: rgba(255, 255, 255, 0.85);", css)
css = re.sub(r"--surface-solid:\s*#[0-9a-fA-F]+;", "--surface-solid: #ffffff;", css)
css = re.sub(r"--border:\s*rgba\([^)]+\);", "--border: rgba(15, 23, 42, 0.08);", css)
css = re.sub(r"--border-strong:\s*rgba\([^)]+\);", "--border-strong: rgba(15, 23, 42, 0.16);", css)
css = re.sub(r"--text:\s*#[0-9a-fA-F]+;", "--text: #1e293b;", css)
css = re.sub(r"--muted:\s*#[0-9a-fA-F]+;", "--muted: #64748b;", css)

# Blue accent colors
css = re.sub(r"--accent:\s*#[0-9a-fA-F]+;", "--accent: #2563eb;", css)
css = re.sub(r"--accent-bright:\s*#[0-9a-fA-F]+;", "--accent-bright: #3b82f6;", css)
css = re.sub(r"--accent-dim:\s*#[0-9a-fA-F]+;", "--accent-dim: #1d4ed8;", css)
css = re.sub(r"--accent-muted:\s*rgba\([^)]+\);", "--accent-muted: rgba(37, 99, 235, 0.12);", css)

# Make radius sharper
css = re.sub(r"--radius-sm:\s*[0-9]+px;", "--radius-sm: 4px;", css)
css = re.sub(r"--radius-md:\s*[0-9]+px;", "--radius-md: 6px;", css)
css = re.sub(r"--radius-lg:\s*[0-9]+px;", "--radius-lg: 8px;", css)
css = re.sub(r"--radius-xl:\s*[0-9]+px;", "--radius-xl: 12px;", css)

# Modern sleek shadows
css = re.sub(r"--shadow-sm:\s*[^;]+;", "--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);", css)
css = re.sub(r"--shadow-md:\s*[^;]+;", "--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);", css)
css = re.sub(r"--shadow-inset:\s*[^;]+;", "--shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.8);", css)

# Button adjustments
css = re.sub(r"\.btn:hover:not\(:disabled\) \{\s*border-color:[^;]+;\s*background:\s*#[0-9a-fA-F]+;\s*\}", 
              ".btn:hover:not(:disabled) {\n  border-color: rgba(15, 23, 42, 0.25);\n  background: #f1f5f9;\n}", css)
css = re.sub(r"color:\s*#[0-9a-fA-F]+;(?=\s+font-weight:\s*700;\s*box-shadow:\s*0 4px)", "color: #ffffff;", css) # primary btn text
css = re.sub(r"box-shadow: 0 4px 20px rgba\(13, 148, 136, 0.35\);", "box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);", css)

# Danger / Success button styles
css = re.sub(r"\.btn\.danger\s*\{\s*border-color:[^;]+;\s*background:[^;]+;\s*color:[^;]+;\s*\}", 
              ".btn.danger {\n  border-color: rgba(239, 68, 68, 0.35);\n  background: rgba(239, 68, 68, 0.08);\n  color: #b91c1c;\n}", css)
css = re.sub(r"\.btn\.success\s*\{\s*border-color:[^;]+;\s*background:[^;]+;\s*color:[^;]+;\s*\}", 
              ".btn.success {\n  border-color: rgba(16, 185, 129, 0.35);\n  background: rgba(16, 185, 129, 0.08);\n  color: #047857;\n}", css)

# Body background image gradients
css = re.sub(r"rgba\(13, 148, 136, 0\.18\)", "rgba(37, 99, 235, 0.04)", css)
css = re.sub(r"rgba\(99, 102, 241, 0\.12\)", "rgba(14, 165, 233, 0.03)", css)
css = re.sub(r"rgba\(8, 145, 178, 0\.1\)", "rgba(99, 102, 241, 0.03)", css)

# Home title color (from #fff to #1e293b)
css = re.sub(r"linear-gradient\(120deg, #fff 25%, var\(--accent-bright\) 100%\)", "linear-gradient(120deg, #1e293b 40%, var(--accent-bright) 100%)", css)

# Home hero card
css = re.sub(r"linear-gradient\(155deg, rgba\(30, 41, 59, 0\.55\) 0%, rgba\(15, 22, 40, 0\.92\) 100%\)", "linear-gradient(155deg, rgba(255, 255, 255, 0.95) 0%, rgba(244, 247, 251, 0.95) 100%)", css)
css = re.sub(r"rgba\(45, 212, 191, 0\.12\)", "rgba(37, 99, 235, 0.04)", css)

# Streak pill
css = re.sub(r"rgba\(120, 53, 15, 0\.35\)", "rgba(255, 251, 235, 0.8)", css)
css = re.sub(r"rgba\(251, 191, 36, 0\.35\)", "rgba(245, 158, 11, 0.4)", css)
css = css.replace("color: #fcd34d;", "color: #b45309;") # streak unit

# Ring visuals
css = re.sub(r"\.prog-ring-bg\s*\{\s*stroke:[^;]+;\s*\}", ".prog-ring-bg {\n  stroke: #e2e8f0;\n}", css)
css = re.sub(r"rgba\(45, 212, 191, 0\.4\)", "rgba(37, 99, 235, 0.25)", css)
css = re.sub(r"rgba\(45, 212, 191, 0\.25\)", "rgba(37, 99, 235, 0.2)", css)

# Modal sheet
css = re.sub(r"linear-gradient\(180deg, rgba\(18, 26, 43, 0\.98\) 0%, rgba\(10, 14, 24, 0\.99\) 100%\)", "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%)", css)

# App hero metric
css = re.sub(r"background: rgba\(15, 22, 40, 0\.75\);", "background: rgba(255, 255, 255, 0.7);", css)

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css)

print("Updated index.css")
