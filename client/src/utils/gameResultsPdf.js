import { jsPDF } from "jspdf";

const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

/**
 * Generate a complete, professional, multi-page Games & Competitions Final Results PDF.
 * Uses A4 Portrait (210 x 297 mm), 14mm margins, clean typography, repeating headers, and page numbering.
 */
export const exportFinalGamesResultsPdf = ({
    festivalYear,
    games = [],
    summary = {},
    allWinners = [],
    orgName = "Unique Residency Mandal",
    action = "download" // "download" | "preview" | "print"
}) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = 210;
    const pageHeight = 297;
    const left = 14;
    const right = 196;
    const contentWidth = right - left; // 182mm
    const pageBreakAt = 275;

    let currentPage = 1;
    let y = 22;

    const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59); // slate-800
        const fullTitle = `${orgName}`.toUpperCase();
        doc.text(fullTitle, pageWidth / 2, y, { align: "center" });

        y += 6.5;
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229); // indigo-600
        doc.text(`GANESH FESTIVAL ${festivalYear} — GAMES & COMPETITIONS`, pageWidth / 2, y, { align: "center" });

        y += 5.5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("OFFICIAL FINAL RESULTS", pageWidth / 2, y, { align: "center" });

        y += 3.5;
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.setLineWidth(0.4);
        doc.line(left, y, right, y);
        y += 6;
    };

    const drawFooter = () => {
        const totalPages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // slate-400

            doc.setDrawColor(226, 232, 240); // slate-200
            doc.setLineWidth(0.25);
            doc.line(left, pageHeight - 14, right, pageHeight - 14);

            const generatedOn = `Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • MandalKhata`;
            doc.text(generatedOn, left, pageHeight - 9);
            doc.text(`Page ${p} of ${totalPages}`, right, pageHeight - 9, { align: "right" });
        }
    };

    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > pageBreakAt) {
            doc.addPage();
            currentPage++;
            y = 18;
            // Draw a subtle header continuation
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`${orgName} • Festival ${festivalYear} — Games & Competitions Results (Contd.)`, left, y);
            y += 3;
            doc.setDrawColor(226, 232, 240);
            doc.line(left, y, right, y);
            y += 6;
        }
    };

    // Draw initial header
    drawHeader();

    // ==================== FESTIVAL SUMMARY BOX ====================
    checkPageBreak(32);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.roundedRect(left, y, contentWidth, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("EXECUTIVE FESTIVAL SUMMARY", left + 4, y + 5.5);

    // Summary Metric Columns
    const metricW = contentWidth / 6;
    const metrics = [
        { label: "Total Games", value: summary.totalGames || 0 },
        { label: "Total Groups", value: summary.totalGroups || 0 },
        { label: "Total Winners", value: summary.totalWinners || 0 },
        { label: "1st Place", value: summary.firstPlaceCount || 0 },
        { label: "2nd Place", value: summary.secondPlaceCount || 0 },
        { label: "3rd Place", value: summary.thirdPlaceCount || 0 },
    ];

    metrics.forEach((m, idx) => {
        const mx = left + idx * metricW;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(idx === 3 ? 180 : idx === 4 ? 70 : idx === 5 ? 160 : 30, idx === 3 ? 130 : idx === 4 ? 80 : idx === 5 ? 90 : 41, idx === 3 ? 20 : idx === 4 ? 90 : idx === 5 ? 40 : 59);
        doc.text(String(m.value), mx + metricW / 2, y + 13, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(m.label, mx + metricW / 2, y + 18, { align: "center" });
    });

    y += 28;

    // ==================== GAMES & GROUPS BREAKDOWN ====================
    if (!games || games.length === 0) {
        checkPageBreak(15);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(148, 163, 184);
        doc.text("No games or competitions recorded for this festival year.", left, y);
        y += 10;
    } else {
        games.forEach((game, gIdx) => {
            // Estimate height needed for game header + at least 1 group
            checkPageBreak(35);

            // Game Header Banner
            doc.setFillColor(241, 245, 249); // slate-100
            doc.setDrawColor(148, 163, 184);
            doc.setLineWidth(0.3);
            doc.rect(left, y, contentWidth, 8.5, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42); // slate-900
            const gameTitle = `${gIdx + 1}. ${game.name.toUpperCase()}`;
            doc.text(gameTitle, left + 3.5, y + 5.5);

            // Date & Meta on right
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            let metaText = `Date: ${formatDate(game.date)}`;
            if (game.location) metaText += ` • Loc: ${game.location}`;
            if (game.status) metaText += ` • [${game.status}]`;
            doc.text(metaText, right - 3.5, y + 5.5, { align: "right" });

            y += 10.5;

            // Optional description
            if (game.description) {
                checkPageBreak(7);
                doc.setFont("helvetica", "italic");
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                const descLines = doc.splitTextToSize(game.description, contentWidth - 6);
                doc.text(descLines, left + 3.5, y);
                y += descLines.length * 4 + 2;
            }

            // Groups
            const groups = game.groups || [];
            if (groups.length === 0) {
                checkPageBreak(9);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(148, 163, 184);
                doc.text("— No categories/groups added for this competition —", left + 6, y + 4);
                y += 8;
            } else {
                groups.forEach((grp) => {
                    // Check break for group card (roughly 26mm for 3 positions)
                    checkPageBreak(28);

                    // Group box
                    doc.setDrawColor(226, 232, 240); // slate-200
                    doc.setFillColor(255, 255, 255);
                    doc.setLineWidth(0.25);
                    doc.rect(left + 2, y, contentWidth - 4, 25, "D");

                    // Group Title Header
                    doc.setFillColor(248, 250, 252);
                    doc.rect(left + 2, y, contentWidth - 4, 6.5, "F");
                    doc.setDrawColor(226, 232, 240);
                    doc.line(left + 2, y + 6.5, right - 2, y + 6.5);

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(8.5);
                    doc.setTextColor(30, 41, 59);
                    let grpTitle = grp.name;
                    const criteria = [];
                    if (grp.category) criteria.push(grp.category);
                    if (grp.ageMin != null && grp.ageMax != null) {
                        criteria.push(`Age ${grp.ageMin}–${grp.ageMax}`);
                    } else if (grp.ageMin != null) {
                        criteria.push(`Age ${grp.ageMin}+`);
                    } else if (grp.ageMax != null) {
                        criteria.push(`Up to Age ${grp.ageMax}`);
                    }
                    if (criteria.length > 0) grpTitle += ` (${criteria.join(" • ")})`;
                    doc.text(grpTitle, left + 5, y + 4.5);

                    // Winners (Positions 1, 2, 3)
                    const results = grp.results || {};
                    const positions = [
                        { pos: 1, label: "1st Place", medal: "[1st]", color: [161, 98, 7] }, // gold
                        { pos: 2, label: "2nd Place", medal: "[2nd]", color: [71, 85, 105] }, // silver
                        { pos: 3, label: "3rd Place", medal: "[3rd]", color: [180, 83, 9] }, // bronze
                    ];

                    const colW = (contentWidth - 6) / 3;
                    positions.forEach((p, pIdx) => {
                        const colX = left + 3 + pIdx * colW;
                        const rowY = y + 8;
                        const w = results[p.pos];

                        // Position label
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(8);
                        doc.setTextColor(...p.color);
                        doc.text(`${p.label}`, colX + 2, rowY + 3.5);

                        // Winner Name & info
                        doc.setFont("helvetica", w ? "bold" : "normal");
                        doc.setFontSize(8);
                        doc.setTextColor(w ? 15 : 148, w ? 23 : 163, w ? 42 : 184);

                        const winnerText = w ? w.winnerName : "Not Assigned";
                        const truncatedName = doc.splitTextToSize(winnerText, colW - 4);
                        doc.text(truncatedName[0] || "-", colX + 2, rowY + 8);

                        // Household / Phone subtext
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(6.8);
                        doc.setTextColor(100, 116, 139);
                        let sub = "";
                        if (w && w.householdInfo) sub = w.householdInfo;
                        else if (w && w.participantPhone) sub = w.participantPhone;
                        if (sub) {
                            const truncatedSub = doc.splitTextToSize(sub, colW - 4);
                            doc.text(truncatedSub[0] || "", colX + 2, rowY + 12);
                        }
                    });

                    y += 28;
                });
            }

            y += 4;
        });
    }

    // ==================== ALL WINNERS DIRECTORY (APPENDIX) ====================
    if (allWinners && allWinners.length > 0) {
        checkPageBreak(40);

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.line(left, y, right, y);
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text("ALL FESTIVAL WINNERS DIRECTORY", left, y);
        y += 5.5;

        // Group allWinners by position 1, 2, 3
        const p1Winners = allWinners.filter((w) => w.position === 1);
        const p2Winners = allWinners.filter((w) => w.position === 2);
        const p3Winners = allWinners.filter((w) => w.position === 3);

        const positionSections = [
            { label: "1ST PLACE WINNERS", list: p1Winners, color: [161, 98, 7] },
            { label: "2ND PLACE WINNERS", list: p2Winners, color: [71, 85, 105] },
            { label: "3RD PLACE WINNERS", list: p3Winners, color: [180, 83, 9] },
        ];

        positionSections.forEach((sec) => {
            if (sec.list.length === 0) return;

            checkPageBreak(18);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...sec.color);
            doc.text(`${sec.label} (${sec.list.length})`, left, y);
            y += 4.5;

            // Table header
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.2);
            doc.rect(left, y, contentWidth, 6, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(71, 85, 105);
            doc.text("#", left + 2, y + 4);
            doc.text("Winner Name", left + 10, y + 4);
            doc.text("Competition / Game", left + 65, y + 4);
            doc.text("Group / Category", left + 125, y + 4);
            y += 6;

            sec.list.forEach((w, idx) => {
                checkPageBreak(6.5);
                doc.setDrawColor(241, 245, 249);
                doc.line(left, y + 5.5, right, y + 5.5);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
                doc.setTextColor(30, 41, 59);

                doc.text(String(idx + 1), left + 2, y + 4);

                let winnerDisplay = w.winnerName;
                if (w.householdInfo) winnerDisplay += ` (${w.householdInfo})`;
                const truncWinner = doc.splitTextToSize(winnerDisplay, 52);
                doc.text(truncWinner[0] || "", left + 10, y + 4);

                const truncGame = doc.splitTextToSize(w.gameName || "-", 55);
                doc.text(truncGame[0] || "", left + 65, y + 4);

                let grpDisplay = w.groupName || "-";
                if (w.category) grpDisplay += ` [${w.category}]`;
                const truncGrp = doc.splitTextToSize(grpDisplay, 54);
                doc.text(truncGrp[0] || "", left + 125, y + 4);

                y += 5.8;
            });

            y += 4;
        });
    }

    // Add page numbers and footers across all generated pages
    drawFooter();

    const safeOrg = orgName.replace(/[^\w-]+/g, "_");
    const filename = `${safeOrg}_Games_Results_${festivalYear}.pdf`;

    if (action === "preview") {
        const blobUrl = doc.output("bloburl");
        window.open(blobUrl, "_blank");
    } else if (action === "print") {
        doc.autoPrint();
        const blobUrl = doc.output("bloburl");
        window.open(blobUrl, "_blank");
    } else {
        doc.save(filename);
    }

    return true;
};
