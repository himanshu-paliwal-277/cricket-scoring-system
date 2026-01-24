/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useMatches } from "@/hooks/useMatches";
import { useTeams } from "@/hooks/useTeams";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton, Pagination } from "@mantine/core";
import { MatchCard } from "@/components/MatchCard";
import { DateInput } from "@mantine/dates";
import { Filter, X } from "lucide-react";
import "@mantine/dates/styles.css";

function MatchesContent() {
  const { teams } = useTeams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial page from URL query params
  const initialPage = Number(searchParams.get("page")) || 1;

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Update URL with new page value
  const updatePageInUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Helper function to format date
  const formatDateForAPI = (date: Date | null) => {
    if (!date) return undefined;
    return date instanceof Date ? date.toISOString().split("T")[0] : undefined;
  };

  // Handle date change from DateInput (string | null) to Date | null
  const handleStartDateChange = (value: string | null) => {
    setStartDate(value ? new Date(value) : null);
  };

  const handleEndDateChange = (value: string | null) => {
    setEndDate(value ? new Date(value) : null);
  };

  // Fetch matches with pagination and filters
  const { matches, pagination, isLoading, createMatch, isCreating } =
    useMatches({
      page: currentPage,
      limit: 10,
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

  // Initialize formData with default team selections
  const [formData, setFormData] = useState({
    teamA: "",
    teamB: "",
    overs: 6,
  });

  // Get default team A and B based on teams array
  const defaultTeamA = useMemo(
    () => (teams && teams.length >= 1 ? teams[0]._id : ""),
    [teams],
  );
  const defaultTeamB = useMemo(
    () => (teams && teams.length >= 2 ? teams[1]._id : ""),
    [teams],
  );

  // Update formData when modal opens with default values
  const handleModalOpen = () => {
    setFormData({
      teamA: defaultTeamA,
      teamB: defaultTeamB,
      overs: 6,
    });
    setIsModalOpen(true);
  };

  // Filter teams for Team A dropdown (exclude Team B)
  const teamAOptions = useMemo(() => {
    return teams.filter((team) => team._id !== formData.teamB);
  }, [teams, formData.teamB]);

  // Filter teams for Team B dropdown (exclude Team A)
  const teamBOptions = useMemo(() => {
    return teams.filter((team) => team._id !== formData.teamA);
  }, [teams, formData.teamA]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMatch(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ teamA: "", teamB: "", overs: 6 });
      },
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
    updatePageInUrl(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updatePageInUrl(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Group matches by date
  const groupMatchesByDate = (matches: any[]) => {
    const groups: { [key: string]: any[] } = {};

    matches.forEach((match) => {
      const date = new Date(match.createdAt);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });

    return groups;
  };

  // Format date label (Today, Yesterday, or date)
  const formatDateLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      // Format: "December 25, 2025 - Sunday"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    }
  };

  const groupedMatches = matches ? groupMatchesByDate(matches) : {};
  const sortedDateKeys = Object.keys(groupedMatches).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Matches</h1>
          <div className="flex gap-2">
            {/* <button
              className="bg-gray-200 py-2 px-3 rounded-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </button> */}
            {user && user?.role === "owner" && (
              <Button onClick={handleModalOpen}>Create Match</Button>
            )}
          </div>
        </div>

        {/* Date Filter Section */}
        {showFilters && (
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Filter by Date Range</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <DateInput
                    value={startDate}
                    onChange={handleStartDateChange}
                    placeholder="Select start date"
                    clearable
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <DateInput
                    value={endDate}
                    onChange={handleEndDateChange}
                    placeholder="Select end date"
                    clearable
                    minDate={startDate || undefined}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(startDate || endDate) && (
                  <button
                    className="flex items-center gap-2 px-3 py-1.5  rounded-sm bg-gray-200"
                    onClick={handleClearFilters}
                  >
                    <X className="w-4 h-4 " />
                    <span className="text-sm">Clear Filters</span>
                  </button>
                )}
              </div>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((index) => (
              <Skeleton key={index} width={"100%"} height={208} radius={6} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-gray-100 rounded-sm px-4 py-2 mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 text-center">
                    {formatDateLabel(dateKey)}
                  </h2>
                </div>

                {/* Matches for this date */}
                <div className="grid gap-4">
                  {groupedMatches[dateKey].map((match) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      userRole={user?.role}
                    />
                  ))}
                </div>
              </div>
            ))}

            {sortedDateKeys.length === 0 && (
              <Card>
                <p className="text-center text-gray-500 py-8">
                  No matches found. Create your first match!
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col justify-center items-center gap-4 py-4">
            <Pagination
              total={pagination.totalPages}
              value={currentPage}
              onChange={handlePageChange}
              size="md"
              radius="sm"
            />
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalMatches} total matches)
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Match"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old logic - commented out */}
            {/* <Select
              label="Team A"
              value={formData.teamA}
              onChange={(e) =>
                setFormData({ ...formData, teamA: e.target.value })
              }
              options={[
                { value: "", label: "Select Team A" },
                ...teams.map((team) => ({
                  value: team._id,
                  label: team.name,
                })),
              ]}
              required
            />

            <Select
              label="Team B"
              value={formData.teamB}
              onChange={(e) =>
                setFormData({ ...formData, teamB: e.target.value })
              }
              options={[
                { value: "", label: "Select Team B" },
                ...teams.map((team) => ({
                  value: team._id,
                  label: team.name,
                })),
              ]}
              required
            /> */}

            {/* New logic - Team A defaults to teams[0], Team B defaults to teams[1] */}
            {/* If one team is selected, it won't show in the other dropdown */}
            <Select
              label="Team A"
              value={formData.teamA}
              onChange={(e) =>
                setFormData({ ...formData, teamA: e.target.value })
              }
              options={teamAOptions.map((team) => ({
                value: team._id,
                label: team.name,
              }))}
              required
            />

            <Select
              label="Team B"
              value={formData.teamB}
              onChange={(e) =>
                setFormData({ ...formData, teamB: e.target.value })
              }
              options={teamBOptions.map((team) => ({
                value: team._id,
                label: team.name,
              }))}
              required
            />

            <Input
              label="Overs"
              type="number"
              min="1"
              max="50"
              value={formData.overs}
              onChange={(e) =>
                setFormData({ ...formData, overs: parseInt(e.target.value) })
              }
              required
            />

            <Button type="submit" className="w-full" isLoading={isCreating}>
              Create Match
            </Button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

export default function MatchesPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Matches</h1>
            </div>
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((index) => (
                <Skeleton key={index} width={"100%"} height={208} radius={6} />
              ))}
            </div>
          </div>
        </Layout>
      }
    >
      <MatchesContent />
    </Suspense>
  );
}
