using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;

namespace UniversityProgramm
{
    public partial class MainWindow : Window
    {
        private const string AllCountries = "All countries";
        private const string AllPrograms = "All programs";

        private readonly List<UniversityCatalogItem> _universities;
        private ICollectionView _catalogView;

        public MainWindow()
        {
            InitializeComponent();

            _universities = BuildCatalog();
            ConfigureFilters();
            ConfigureCatalogList();
        }

        private void ConfigureFilters()
        {
            var countries = new[] { AllCountries }
                .Concat(_universities.Select(university => university.Country).Distinct().OrderBy(country => country))
                .ToList();

            var programs = new[] { AllPrograms }
                .Concat(_universities.Select(university => university.DegreeFocus).Distinct().OrderBy(program => program))
                .ToList();

            CountryFilter.ItemsSource = countries;
            ProgramFilter.ItemsSource = programs;
            CountryFilter.SelectedIndex = 0;
            ProgramFilter.SelectedIndex = 0;
        }

        private void ConfigureCatalogList()
        {
            _catalogView = CollectionViewSource.GetDefaultView(_universities);
            _catalogView.Filter = MatchesCurrentFilters;
            CatalogList.ItemsSource = _catalogView;

            RefreshCatalog();
            CatalogList.SelectedIndex = 0;
        }

        private bool MatchesCurrentFilters(object value)
        {
            var university = value as UniversityCatalogItem;
            if (university == null)
            {
                return false;
            }

            var country = CountryFilter.SelectedItem as string;
            if (!string.IsNullOrEmpty(country) && country != AllCountries && university.Country != country)
            {
                return false;
            }

            var program = ProgramFilter.SelectedItem as string;
            if (!string.IsNullOrEmpty(program) && program != AllPrograms && university.DegreeFocus != program)
            {
                return false;
            }

            var query = (SearchBox.Text ?? string.Empty).Trim();
            if (query.Length == 0)
            {
                return true;
            }

            var searchableText = string.Join(" ",
                university.Name,
                university.City,
                university.Country,
                university.DegreeFocus,
                university.Description,
                string.Join(" ", university.PopularPrograms),
                string.Join(" ", university.Highlights));

            return CultureInfo.CurrentCulture.CompareInfo
                .IndexOf(searchableText, query, CompareOptions.IgnoreCase) >= 0;
        }

        private void RefreshCatalog()
        {
            if (_catalogView == null)
            {
                return;
            }

            _catalogView.Refresh();
            var resultCount = _catalogView.Cast<object>().Count();
            SummaryText.Text = string.Format(
                CultureInfo.CurrentCulture,
                "{0} public universities available. Use search and filters to compare programs, cost, admissions, and campus strengths.",
                resultCount);

            if (resultCount == 0)
            {
                ClearDetails();
                return;
            }

            if (CatalogList.SelectedItem == null || !_catalogView.Cast<object>().Contains(CatalogList.SelectedItem))
            {
                CatalogList.SelectedItem = _catalogView.Cast<object>().FirstOrDefault();
            }
        }

        private void UpdateSelectedUniversity(UniversityCatalogItem university)
        {
            if (university == null)
            {
                ClearDetails();
                return;
            }

            SelectedNameText.Text = university.Name;
            SelectedLocationText.Text = university.LocationDisplay;
            EstablishedText.Text = university.Established.ToString(CultureInfo.CurrentCulture);
            StudentsText.Text = university.StudentCount;
            AcceptanceText.Text = university.AcceptanceRate;
            TuitionText.Text = university.TuitionSummary;
            SelectedDescriptionText.Text = university.Description;
            ProgramsList.ItemsSource = university.PopularPrograms;
            HighlightsList.ItemsSource = university.Highlights;
            WebsiteButton.Tag = university.WebsiteUrl;
            WebsiteButton.IsEnabled = !string.IsNullOrWhiteSpace(university.WebsiteUrl);
        }

        private void ClearDetails()
        {
            SelectedNameText.Text = "No matching universities";
            SelectedLocationText.Text = "Adjust the filters or search terms to expand the catalog.";
            EstablishedText.Text = "-";
            StudentsText.Text = "-";
            AcceptanceText.Text = "-";
            TuitionText.Text = "-";
            SelectedDescriptionText.Text = string.Empty;
            ProgramsList.ItemsSource = null;
            HighlightsList.ItemsSource = null;
            WebsiteButton.Tag = null;
            WebsiteButton.IsEnabled = false;
        }

        private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            RefreshCatalog();
        }

        private void Filter_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            RefreshCatalog();
        }

        private void CatalogList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            UpdateSelectedUniversity(CatalogList.SelectedItem as UniversityCatalogItem);
        }

        private void WebsiteButton_Click(object sender, RoutedEventArgs e)
        {
            var url = WebsiteButton.Tag as string;
            if (string.IsNullOrWhiteSpace(url))
            {
                return;
            }

            Process.Start(new ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            });
        }

        private void Exit(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private static List<UniversityCatalogItem> BuildCatalog()
        {
            return new List<UniversityCatalogItem>
            {
                new UniversityCatalogItem
                {
                    Name = "University of California, Berkeley",
                    City = "Berkeley",
                    Country = "United States",
                    DegreeFocus = "Engineering",
                    TuitionSummary = "$14k in-state",
                    Established = 1868,
                    StudentCount = "45k",
                    AcceptanceRate = "11%",
                    WebsiteUrl = "https://www.berkeley.edu",
                    Description = "A large public research university known for computer science, engineering, economics, and policy programs with direct access to the Bay Area innovation ecosystem.",
                    PopularPrograms = new[] { "Computer Science", "Electrical Engineering", "Economics", "Public Policy" },
                    Highlights = new[] { "Research-intensive public campus", "Strong startup and internship network", "Urban campus near San Francisco" }
                },
                new UniversityCatalogItem
                {
                    Name = "University of Michigan",
                    City = "Ann Arbor",
                    Country = "United States",
                    DegreeFocus = "Business",
                    TuitionSummary = "$18k in-state",
                    Established = 1817,
                    StudentCount = "52k",
                    AcceptanceRate = "18%",
                    WebsiteUrl = "https://umich.edu",
                    Description = "A flagship public university with broad undergraduate choice, nationally recognized business and engineering schools, and a highly active campus community.",
                    PopularPrograms = new[] { "Business Administration", "Mechanical Engineering", "Data Science", "Political Science" },
                    Highlights = new[] { "Major alumni network", "Big Ten campus life", "Extensive research and honors options" }
                },
                new UniversityCatalogItem
                {
                    Name = "University of Toronto",
                    City = "Toronto",
                    Country = "Canada",
                    DegreeFocus = "Computer Science",
                    TuitionSummary = "CA$6k domestic",
                    Established = 1827,
                    StudentCount = "97k",
                    AcceptanceRate = "43%",
                    WebsiteUrl = "https://www.utoronto.ca",
                    Description = "Canada's largest public research university, offering a dense catalog of programs across three campuses and strong links to Toronto employers.",
                    PopularPrograms = new[] { "Computer Science", "Life Sciences", "Rotman Commerce", "Engineering Science" },
                    Highlights = new[] { "Three-campus system", "Downtown research hospitals nearby", "Large international student community" }
                },
                new UniversityCatalogItem
                {
                    Name = "Technical University of Munich",
                    City = "Munich",
                    Country = "Germany",
                    DegreeFocus = "Engineering",
                    TuitionSummary = "Low public fees",
                    Established = 1868,
                    StudentCount = "52k",
                    AcceptanceRate = "Selective",
                    WebsiteUrl = "https://www.tum.de/en",
                    Description = "A public technical university with strong engineering, informatics, and applied science programs across Munich, Garching, and other Bavarian sites.",
                    PopularPrograms = new[] { "Mechanical Engineering", "Informatics", "Management and Technology", "Aerospace" },
                    Highlights = new[] { "Close industry partnerships", "Research-led technical programs", "Many graduate programs in English" }
                },
                new UniversityCatalogItem
                {
                    Name = "University of Amsterdam",
                    City = "Amsterdam",
                    Country = "Netherlands",
                    DegreeFocus = "Social Sciences",
                    TuitionSummary = "EU public rate",
                    Established = 1632,
                    StudentCount = "43k",
                    AcceptanceRate = "Program based",
                    WebsiteUrl = "https://www.uva.nl/en",
                    Description = "A public research university with a broad catalog in social sciences, humanities, business, informatics, and media studies in an international city setting.",
                    PopularPrograms = new[] { "Communication Science", "Psychology", "Business Analytics", "Political Science" },
                    Highlights = new[] { "Many English-taught tracks", "City-integrated campus", "Strong social science research profile" }
                },
                new UniversityCatalogItem
                {
                    Name = "University of Melbourne",
                    City = "Melbourne",
                    Country = "Australia",
                    DegreeFocus = "Life Sciences",
                    TuitionSummary = "AU public rates",
                    Established = 1853,
                    StudentCount = "54k",
                    AcceptanceRate = "70%",
                    WebsiteUrl = "https://www.unimelb.edu.au",
                    Description = "A public university with a wide course catalog, prominent health and life science programs, and a central role in Australia's research sector.",
                    PopularPrograms = new[] { "Biomedicine", "Commerce", "Design", "Engineering" },
                    Highlights = new[] { "Parkville biomedical precinct", "Flexible undergraduate model", "Large international intake" }
                },
                new UniversityCatalogItem
                {
                    Name = "University of Warsaw",
                    City = "Warsaw",
                    Country = "Poland",
                    DegreeFocus = "Data Science",
                    TuitionSummary = "EU public rate",
                    Established = 1816,
                    StudentCount = "37k",
                    AcceptanceRate = "Program based",
                    WebsiteUrl = "https://www.uw.edu.pl",
                    Description = "A major public university in Central Europe with strong mathematics, informatics, economics, and international relations programs.",
                    PopularPrograms = new[] { "Data Science", "Economics", "International Relations", "Mathematics" },
                    Highlights = new[] { "Capital-city internships", "Growing English program catalog", "Strong quantitative departments" }
                },
                new UniversityCatalogItem
                {
                    Name = "National University of Singapore",
                    City = "Singapore",
                    Country = "Singapore",
                    DegreeFocus = "Computer Science",
                    TuitionSummary = "Subsidized public rate",
                    Established = 1905,
                    StudentCount = "40k",
                    AcceptanceRate = "5%",
                    WebsiteUrl = "https://www.nus.edu.sg",
                    Description = "A public autonomous university with globally competitive computing, engineering, business, and public policy programs in Southeast Asia.",
                    PopularPrograms = new[] { "Computer Science", "Business Analytics", "Engineering", "Public Policy" },
                    Highlights = new[] { "Strong Asia-Pacific employer links", "Residential college options", "Large research enterprise" }
                }
            };
        }
    }

    public class UniversityCatalogItem
    {
        public string Name { get; set; }

        public string City { get; set; }

        public string Country { get; set; }

        public string DegreeFocus { get; set; }

        public string TuitionSummary { get; set; }

        public int Established { get; set; }

        public string StudentCount { get; set; }

        public string AcceptanceRate { get; set; }

        public string WebsiteUrl { get; set; }

        public string Description { get; set; }

        public string[] PopularPrograms { get; set; }

        public string[] Highlights { get; set; }

        public string LocationDisplay
        {
            get { return string.Format(CultureInfo.CurrentCulture, "{0}, {1}", City, Country); }
        }
    }
}
