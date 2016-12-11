import path = require('path');
import fs = require('fs');
import mkdir = require('mkdirp');
import minimist = require("minimist");
import { Frame, D3Frame } from "./types";
const ejs = require('ejs');

interface Options {
    input: string;
    output: string;
}

function createFiller(value): D3Frame {
    return {
        name: "inner",
        filler: true,
        value
    }
};

function transformEntry(e: Frame): D3Frame {
    let chidren: D3Frame[] = undefined;
    let currentStart = e.start;
    if (e.children && e.children.length > 0) {
        chidren = [];
        for (let child of e.children) {
            if (currentStart < child.start) {
                chidren.push(createFiller(child.start - currentStart));
            }
            chidren.push(transformEntry(child));
            currentStart = child.start + child.time;
        }

        if (currentStart < (e.start + e.time)) {
            chidren.push(createFiller((e.start + e.time) - currentStart));
        }
    }

    return {
        name: `${e.category || ""} - ${e.description || ""}`,
        value: e.time,
        children: chidren
    };
}

function loadData(inputPath): D3Frame {
    let { entries }: { entries: Frame[] } = require(inputPath);

    const last = entries[entries.length - 1]
    var all = transformEntry({
        category: "ALL",
        start: 0,
        time: last.start + last.time,
        children: entries
    })

    return all;
}

function getAssetContent(filename) {
    return fs.readFileSync(`${__dirname}/libs/${filename}`, 'utf8');
}

function generateReport(options) {
    let inputPath = options.input;
    if (!path.isAbsolute(inputPath)) {
        inputPath = path.resolve(path.join(__dirname, inputPath));
    }
    let outputPath = options.output;
    if (!path.isAbsolute(outputPath)) {
        outputPath = path.resolve(path.join(__dirname, outputPath));
    }

    const data = loadData(inputPath);

    if (!data) return;

    ejs.renderFile(
        `${__dirname}/views/viewer.ejs`,
        {
            mode: 'static',
            data: JSON.stringify(data),
            assetContent: getAssetContent
        },
        (err, reportHtml) => {
            if (err) {
                console.log("ERROR: " + err);
            }
mkdir.sync(path.dirname(outputPath));
            fs.writeFileSync(outputPath, reportHtml);
        }
    );
}


const options: Options = <any>minimist(process.argv.slice(2), {
    default: {
        input: "input.json",
        output: "report.html"
    },
    alias: {
        i: ["input"],
        o: ["output"],
    }
});

generateReport(options);