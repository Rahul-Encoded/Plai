"use client";
import React from "react";
import { Button } from "./button";

interface SidebarProps {
  onInsertCell: () => void;
}

export default function Sidebar({ onInsertCell }: SidebarProps) {
  return (
    <div className="sticky top-0 p-4 space-y-4">
      <h2 className="text-lg font-semibold">Actions</h2>
      <Button onClick={onInsertCell}>Insert a cell</Button>
    </div>
  );
}