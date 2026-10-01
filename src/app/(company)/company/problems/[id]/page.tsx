"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api/problems";
import { ProblemForm } from "@/components/company/ProblemForm";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";

export default function EditProblemPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: ["problem", id], queryFn: () => problemsApi.getById(id) });

  if (query.isLoading) return <Spinner />;
  if (query.isError || !query.data) return <Alert variant="error">Problem not found.</Alert>;

  return <ProblemForm existing={query.data.data} />;
}
