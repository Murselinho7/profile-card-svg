#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const WIDTH = 920;

function fail(message) {
  process.stderr.write(message + "\n");
  process.exit(1);
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function loadConfig(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (err) {
    fail("Cannot read " + file);
  }
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail("config JSON is invalid: " + err.message);
  }
  if (!data || typeof data.name !== "string" || !data.name.trim()) {
    fail("config.name is required");
  }
  const skills = Array.isArray(data.skills)
    ? data.skills.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
  const socials = Array.isArray(data.socials)
    ? data.socials
        .filter((item) => item && typeof item.label === "string" && typeof item.handle === "string")
        .map((item) => ({ label: item.label.trim(), handle: item.handle.trim() }))
        .filter((item) => item.label && item.handle)
    : [];
  return {
    name: data.name.trim(),
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Developer",
    bio: typeof data.bio === "string" ? data.bio.trim() : "",
    skills: skills.slice(0, 12),
    socials: socials.slice(0, 4),
  };
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] || "")
    .join("")
    .toUpperCase();
}

function wrap(text, max) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (let i = 0; i < words.length; i += 1) {
    const next = line ? line + " " + words[i] : words[i];
    if (Array.from(next).length > max && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function layoutPills(labels, maxWidth) {
  const gap = 8;
  const widthOf = (text) => Math.ceil(Array.from(text).length * 7.6 + 28);
  const rows = [];
  let row = [];
  let used = 0;
  let index = 0;
  while (index < labels.length && rows.length < 2) {
    const text = labels[index];
    const width = Math.min(maxWidth, widthOf(text));
    const nextUsed = row.length === 0 ? width : used + gap + width;
    if (row.length && nextUsed > maxWidth) {
      rows.push(row);
      row = [];
      used = 0;
      continue;
    }
    row.push({ text: text, width: width });
    used = nextUsed;
    index += 1;
  }
  if (row.length && rows.length < 2) rows.push(row);
  const hidden = labels.length - index;
  if (hidden > 0 && rows.length) {
    const last = rows[rows.length - 1];
    const chip = "+" + hidden;
    const chipWidth = widthOf(chip);
    const rowUsed = last.reduce((sum, pill, pillIndex) => sum + pill.width + (pillIndex ? gap : 0), 0);
    if (rowUsed + gap + chipWidth <= maxWidth) {
      last.push({ text: chip, width: chipWidth });
    }
  }
  return rows;
}

function buildSvg(config) {
  const nameSize = Array.from(config.name).length > 22 ? 28 : 36;
  const bioLines = config.bio ? wrap(config.bio, 72) : [];
  const pills = layoutPills(config.skills, 820);
  const headerBottom = 168 + Math.max(0, bioLines.length - 1) * 22;
  const pillTop = headerBottom + (pills.length ? 12 : 0);
  const pillBlock = pills.length ? pills.length * 36 - 8 : 0;
  const socialTop = pillTop + pillBlock + (config.socials.length ? 36 : 16);
  const height = Math.max(260, socialTop + (config.socials.length ? 42 : 24));

  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      WIDTH +
      '" height="' +
      height +
      '" viewBox="0 0 ' +
      WIDTH +
      " " +
      height +
      '" role="img">'
  );
  parts.push("<title>" + esc(config.name) + " profile card</title>");
  parts.push("<desc>" + esc(config.title + (config.bio ? ". " + config.bio : "")) + "</desc>");
  parts.push("<defs>");
  parts.push('<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">');
  parts.push('<stop offset="0%" stop-color="#071018"/>');
  parts.push('<stop offset="55%" stop-color="#10182c"/>');
  parts.push('<stop offset="100%" stop-color="#1a1030"/>');
  parts.push("</linearGradient>");
  parts.push('<linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">');
  parts.push('<stop offset="0%" stop-color="#5eead4"/>');
  parts.push('<stop offset="100%" stop-color="#818cf8"/>');
  parts.push("</linearGradient>");
  parts.push("</defs>");
  parts.push('<rect width="' + WIDTH + '" height="' + height + '" rx="24" fill="url(#bg)"/>');
  parts.push('<circle cx="820" cy="36" r="90" fill="#5eead4" fill-opacity="0.08"/>');
  parts.push(
    '<circle cx="' + (WIDTH - 36) + '" cy="' + (height - 16) + '" r="72" fill="#818cf8" fill-opacity="0.08"/>'
  );
  parts.push(
    '<rect x="18" y="18" width="884" height="' +
      (height - 36) +
      '" rx="18" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.16"/>'
  );
  parts.push('<rect x="36" y="34" width="120" height="6" rx="3" fill="url(#accent)"/>');

  parts.push('<circle cx="86" cy="112" r="40" fill="#0c1424" stroke="url(#accent)" stroke-width="2"/>');
  parts.push(
    '<text x="86" y="112" text-anchor="middle" dominant-baseline="middle" fill="#f4f7fb" font-size="22" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-weight="700">' +
      esc(initials(config.name)) +
      "</text>"
  );
  parts.push(
    '<text x="148" y="96" fill="#f8fbff" font-size="' +
      nameSize +
      '" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-weight="700">' +
      esc(config.name) +
      "</text>"
  );
  parts.push(
    '<text x="148" y="126" fill="#9fb0c8" font-size="16" font-family="Segoe UI, Helvetica, Arial, sans-serif">' +
      esc(config.title) +
      "</text>"
  );
  bioLines.forEach((line, index) => {
    parts.push(
      '<text x="148" y="' +
        (156 + index * 22) +
        '" fill="#d5deea" font-size="14" font-family="Segoe UI, Helvetica, Arial, sans-serif">' +
        esc(line) +
        "</text>"
    );
  });

  pills.forEach((row, rowIndex) => {
    let x = 36;
    const y = pillTop + rowIndex * 36;
    row.forEach((pill) => {
      parts.push(
        '<rect x="' +
          x +
          '" y="' +
          y +
          '" width="' +
          pill.width +
          '" height="28" rx="14" fill="#5eead4" fill-opacity="0.10" stroke="#5eead4" stroke-opacity="0.85"/>'
      );
      parts.push(
        '<text x="' +
          (x + pill.width / 2) +
          '" y="' +
          (y + 14) +
          '" text-anchor="middle" dominant-baseline="middle" fill="#e7fffb" font-size="13" font-family="Segoe UI, Helvetica, Arial, sans-serif">' +
          esc(pill.text) +
          "</text>"
      );
      x += pill.width + 8;
    });
  });

  if (config.socials.length) {
    const socialText = config.socials.map((item) => item.label + "  " + item.handle).join("   ·   ");
    parts.push(
      '<text x="36" y="' +
        socialTop +
        '" fill="#b7c3d7" font-size="14" font-family="Segoe UI, Helvetica, Arial, sans-serif">' +
        esc(socialText) +
        "</text>"
    );
  }

  parts.push("</svg>");
  parts.push("");
  return parts.join("\n");
}

function main() {
  const configPath = path.resolve(process.argv[2] || path.join(__dirname, "config.json"));
  const config = loadConfig(configPath);
  const svg = buildSvg(config);
  const outPath = path.join(path.dirname(configPath), "profile-card.svg");
  fs.writeFileSync(outPath, svg, "utf8");
  process.stdout.write("Wrote " + outPath + "\n");
}

main();
