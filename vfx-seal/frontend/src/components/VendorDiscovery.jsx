import { useState, useEffect } from "react";
import VendorCarousel from "./VendorCarousel";
import api from "../api/client";

export default function VendorDiscovery() {
  const [vendorCategories, setVendorCategories] = useState({
    topRated: [],
    veterans: [],
    bigTeam: [],
    newStudios: [],
    regions: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchCategorizedVendors = async () => {
      try {
        // Fetch all vendors with necessary data
        const response = await api.get("/vendors?limit=100"); // Get more vendors for categorization
        const vendors = response.data.vendors || [];

        if (vendors.length === 0) {
          setVendorCategories((prev) => ({ ...prev, loading: false }));
          return;
        }

        const currentYear = new Date().getFullYear();

        // Categorize vendors
        const categorized = {
          // Top Rated: Highest global scores (8.5+)
          topRated: vendors
            .filter((v) => v.globalScore >= 8.5)
            .sort((a, b) => b.globalScore - a.globalScore)
            .slice(0, 12),

          // Veterans: Studios founded before 2010
          veterans: vendors
            .filter((v) => v.foundedYear && v.foundedYear < 2010)
            .sort((a, b) => a.foundedYear - b.foundedYear)
            .slice(0, 12),

          // Big Team: Large and Medium studios
          bigTeam: vendors
            .filter((v) => ["Large", "Medium"].includes(v.size))
            .sort((a, b) => {
              const sizeOrder = { Large: 3, Medium: 2 };
              return (sizeOrder[b.size] || 0) - (sizeOrder[a.size] || 0);
            })
            .slice(0, 12),

          // New Studios: Founded in last 2-3 years
          newStudios: vendors
            .filter((v) => v.foundedYear && currentYear - v.foundedYear <= 3)
            .sort((a, b) => b.foundedYear - a.foundedYear)
            .slice(0, 12),

          // Group by regions for regional discovery
          regions: vendors.reduce((acc, vendor) => {
            const region = getRegionFromCountry(vendor.country);
            if (!acc[region]) acc[region] = [];
            acc[region].push(vendor);
            return acc;
          }, {}),

          loading: false,
          error: null,
        };

        // Sort regional vendors by score and limit to top 8 per region
        Object.keys(categorized.regions).forEach((region) => {
          categorized.regions[region] = categorized.regions[region]
            .sort((a, b) => b.globalScore - a.globalScore)
            .slice(0, 8);
        });

        setVendorCategories(categorized);
      } catch (error) {
        console.error("Error fetching vendor categories:", error);
        setVendorCategories((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to load vendor categories",
        }));
      }
    };

    fetchCategorizedVendors();
  }, []);

  // Helper function to map countries to regions
  const getRegionFromCountry = (country) => {
    const regionMap = {
      "United States": "North America",
      Canada: "North America",
      Mexico: "North America",

      "United Kingdom": "Europe",
      France: "Europe",
      Germany: "Europe",
      Spain: "Europe",
      Italy: "Europe",
      Netherlands: "Europe",
      Belgium: "Europe",
      Sweden: "Europe",
      Norway: "Europe",
      Denmark: "Europe",
      Finland: "Europe",

      Australia: "Asia Pacific",
      "New Zealand": "Asia Pacific",
      Japan: "Asia Pacific",
      "South Korea": "Asia Pacific",
      Singapore: "Asia Pacific",
      India: "Asia Pacific",
      China: "Asia Pacific",
      Thailand: "Asia Pacific",
      Malaysia: "Asia Pacific",

      Brazil: "South America",
      Argentina: "South America",
      Chile: "South America",
      Colombia: "South America",
    };

    return regionMap[country] || "Other";
  };

  if (vendorCategories.loading) {
    return (
      <section className="vendor-discovery-section">
        <div className="container">
          <div className="discovery-header">
            <span className="section-tag">Discovery</span>
            <h2 className="section-title">Explore VFX Studios</h2>
            <p className="section-subtitle">
              Discover certified vendors across different categories and regions
            </p>
          </div>
          <div className="carousel-loading">
            <div className="loading-carousel-skeleton">
              <div className="loading-carousel-title"></div>
              <div className="loading-carousel-track">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="loading-carousel-card"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (vendorCategories.error) {
    return (
      <section className="vendor-discovery-section">
        <div className="container">
          <div className="discovery-error">
            <p>Unable to load vendor categories. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="vendor-discovery-section">
      <div className="container">
        <div className="discovery-header">
          <span className="section-tag">Discovery</span>
          <h2 className="section-title">Explore VFX Studios</h2>
          <p className="section-subtitle">
            Discover certified vendors across different categories and regions
          </p>
        </div>

        <div className="discovery-carousels">
          {/* Top Rated Studios */}
          {vendorCategories.topRated.length > 0 && (
            <VendorCarousel
              title="Top Rated Studios"
              vendors={vendorCategories.topRated}
              category="topRated"
            />
          )}

          {/* Veteran Studios */}
          {vendorCategories.veterans.length > 0 && (
            <VendorCarousel
              title="Industry Veterans"
              vendors={vendorCategories.veterans}
              category="veterans"
            />
          )}

          {/* Large Teams */}
          {vendorCategories.bigTeam.length > 0 && (
            <VendorCarousel
              title="Big Teams & Studios"
              vendors={vendorCategories.bigTeam}
              category="bigTeam"
            />
          )}

          {/* New Studios */}
          {vendorCategories.newStudios.length > 0 && (
            <VendorCarousel
              title="Rising Stars"
              vendors={vendorCategories.newStudios}
              category="newStudios"
            />
          )}

          {/* Regional Carousels */}
          {Object.entries(vendorCategories.regions)
            .filter(([region, vendors]) => vendors.length >= 3) // Only show regions with 3+ vendors
            .sort(([, a], [, b]) => b.length - a.length) // Sort by vendor count
            .slice(0, 3) // Show top 3 regions only
            .map(([region, vendors]) => (
              <VendorCarousel
                key={region}
                title={region}
                vendors={vendors}
                category={`region-${region.toLowerCase().replace(" ", "-")}`}
              />
            ))}}
        </div>
      </div>
    </section>
  );
}
