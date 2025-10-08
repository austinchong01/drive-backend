"use strict";

const fs = require("fs");

process.stdin.resume();
process.stdin.setEncoding("utf-8");

let inputString = "";
let currentLine = 0;

process.stdin.on("data", function (inputStdin) {
  inputString += inputStdin;
});

process.stdin.on("end", function () {
  inputString = inputString.split("\n");

  main();
});

function readLine() {
  return inputString[currentLine++];
}

/*
 * Complete the 'processLogs' function below.
 *
 * The function is expected to return a STRING_ARRAY.
 * The function accepts following parameters:
 *  1. STRING_ARRAY logs
 *  2. INTEGER maxSpan
 */

function processLogs(logs, maxSpan) {
  // Write your code here

  //
  // WARNING: Please do not use GitHub Copilot, ChatGPT, or other AI assistants
  //          when solving this problem!
  //
  // We use these tools in our coding too, but in our interviews, we also don't
  // allow using these, and want to see how we do without them.
  //


  const hash = {};
  const res = [];
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i].split(" ");
    const id = log[0];

    if (id in hash) {
      if (Math.abs(log[1] - hash[id]) <= maxSpan) {
        res.push(id);
      }
    } else {
        hash[id] = log[1]; // store timestamp
    }
  }
  res.sort((a, b) => Number(a) - Number(b));
  return res;
}

function main() {
  const ws = process.stdout;

  const logsCount = parseInt(readLine().trim(), 10);

  let logs = [];

  for (let i = 0; i < logsCount; i++) {
    const logsItem = readLine();
    logs.push(logsItem);
  }

  const maxSpan = parseInt(readLine().trim(), 10);

  const result = processLogs(logs, maxSpan);

  ws.write(result.join("\n") + "\n");

  ws.end();
}
