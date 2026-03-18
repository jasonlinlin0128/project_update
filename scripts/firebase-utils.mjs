#!/usr/bin/env node

/**
 * Firebase CLI utility for managing data.
 *
 * Project-specific:
 *   node scripts/firebase-utils.mjs list-projects
 *   node scripts/firebase-utils.mjs get-project <docId>
 *   node scripts/firebase-utils.mjs update-project <docId> '{"progress":70,"status":"開發中"}'
 *   node scripts/firebase-utils.mjs add-project '{"name":"新專案","status":"規劃中"}'
 *
 * Generic (any collection):
 *   node scripts/firebase-utils.mjs list-collection <collectionName>
 *   node scripts/firebase-utils.mjs get-record <collectionName> <docId>
 *   node scripts/firebase-utils.mjs update-collection <collectionName> <docId> '<json>'
 *   node scripts/firebase-utils.mjs add-collection <collectionName> '<json>'
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlOglfZtVNC3wkH8FzxPRWpZjbioOisKA",
  authDomain: "project-update-ab874.firebaseapp.com",
  projectId: "project-update-ab874",
  storageBucket: "project-update-ab874.appspot.com",
  messagingSenderId: "149051930119",
  appId: "1:149051930119:web:fa2be596b9c047fdb4dca2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const [,, command, ...args] = process.argv;

async function listProjects() {
  const snap = await getDocs(collection(db, "projects"));
  const projects = snap.docs.map(d => ({
    id: d.id,
    name: d.data().name,
    status: d.data().status || "未設定",
    progress: d.data().progress ?? 0,
    priority: d.data().priority || "未設定",
    projectOwner: d.data().projectOwner || d.data().owner || "未指派",
    description: d.data().description || "",
    startTime: d.data().startTime || "",
    dueDate: d.data().dueDate || ""
  }));

  // Sort by name for readability
  projects.sort((a, b) => a.name.localeCompare(b.name, "zh-TW"));

  console.log(JSON.stringify(projects, null, 2));
}

async function getProject(docId) {
  if (!docId) {
    console.error("Error: docId is required");
    process.exit(1);
  }
  const snap = await getDoc(doc(db, "projects", docId));
  if (!snap.exists()) {
    console.error(`Error: project ${docId} not found`);
    process.exit(1);
  }
  console.log(JSON.stringify({ id: snap.id, ...snap.data() }, null, 2));
}

async function updateProject(docId, jsonStr) {
  if (!docId || !jsonStr) {
    console.error("Error: docId and JSON data are required");
    console.error("Usage: update-project <docId> '{\"progress\":70}'");
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error: invalid JSON:", e.message);
    process.exit(1);
  }

  // Always set updatedAt
  data.updatedAt = new Date().toISOString();

  const ref = doc(db, "projects", docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.error(`Error: project ${docId} not found`);
    process.exit(1);
  }

  await updateDoc(ref, data);
  console.log(JSON.stringify({ success: true, id: docId, updated: data }));
}

async function addProject(jsonStr) {
  if (!jsonStr) {
    console.error("Error: JSON data is required");
    console.error('Usage: add-project \'{"name":"新專案","status":"規劃中"}\'');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error: invalid JSON:", e.message);
    process.exit(1);
  }

  if (!data.name) {
    console.error("Error: project name is required");
    process.exit(1);
  }

  // Set defaults
  data.progress = data.progress ?? 0;
  data.status = data.status || "規劃中";
  data.priority = data.priority || "中";
  data.createdAt = new Date().toISOString();
  data.updatedAt = new Date().toISOString();

  const ref = await addDoc(collection(db, "projects"), data);
  console.log(JSON.stringify({ success: true, id: ref.id, data }));
}

// ── Generic collection commands ──────────────────────────────────────────────

async function listCollection(collectionName) {
  if (!collectionName) {
    console.error("Error: collectionName is required");
    process.exit(1);
  }
  const snap = await getDocs(collection(db, collectionName));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(JSON.stringify(items, null, 2));
}

async function getRecord(collectionName, docId) {
  if (!collectionName || !docId) {
    console.error("Error: collectionName and docId are required");
    process.exit(1);
  }
  const snap = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) {
    console.error(`Error: ${collectionName}/${docId} not found`);
    process.exit(1);
  }
  console.log(JSON.stringify({ id: snap.id, ...snap.data() }, null, 2));
}

async function updateCollection(collectionName, docId, jsonStr) {
  if (!collectionName || !docId || !jsonStr) {
    console.error("Error: collectionName, docId, and JSON data are required");
    console.error("Usage: update-collection <collectionName> <docId> '<json>'");
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error: invalid JSON:", e.message);
    process.exit(1);
  }

  data.updatedAt = new Date().toISOString();

  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.error(`Error: ${collectionName}/${docId} not found`);
    process.exit(1);
  }

  await updateDoc(ref, data);
  console.log(JSON.stringify({ success: true, collection: collectionName, id: docId, updated: data }));
}

async function addCollection(collectionName, jsonStr) {
  if (!collectionName || !jsonStr) {
    console.error("Error: collectionName and JSON data are required");
    console.error("Usage: add-collection <collectionName> '<json>'");
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error: invalid JSON:", e.message);
    process.exit(1);
  }

  data.createdAt = new Date().toISOString();
  data.updatedAt = new Date().toISOString();

  const ref = await addDoc(collection(db, collectionName), data);
  console.log(JSON.stringify({ success: true, collection: collectionName, id: ref.id, data }));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    switch (command) {
      case "list-projects":
        await listProjects();
        break;
      case "get-project":
        await getProject(args[0]);
        break;
      case "update-project":
        await updateProject(args[0], args[1]);
        break;
      case "add-project":
        await addProject(args[0]);
        break;
      case "list-collection":
        await listCollection(args[0]);
        break;
      case "get-record":
        await getRecord(args[0], args[1]);
        break;
      case "update-collection":
        await updateCollection(args[0], args[1], args[2]);
        break;
      case "add-collection":
        await addCollection(args[0], args[1]);
        break;
      default:
        console.error("Available commands:");
        console.error("  list-projects                                    List all projects (formatted)");
        console.error("  get-project <docId>                              Get a project by ID");
        console.error("  update-project <docId> '<json>'                  Update a project");
        console.error("  add-project '<json>'                             Add a new project");
        console.error("  list-collection <collection>                     List any collection");
        console.error("  get-record <collection> <docId>                  Get any record by ID");
        console.error("  update-collection <collection> <docId> '<json>'  Update any record");
        console.error("  add-collection <collection> '<json>'             Add to any collection");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  // Firebase client SDK keeps connections open; force exit
  process.exit(0);
}

main();
