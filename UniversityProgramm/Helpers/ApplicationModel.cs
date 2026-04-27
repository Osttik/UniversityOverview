#nullable disable

using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Data;

namespace UniversityProgramm.Helpers
{
    public class ApplicationModel : INotifyPropertyChanged
    {
        private University _selectedUniversity;
        private string _searchText;

        public ApplicationModel()
        {
            Universities = new ObservableCollection<University>(CreateUniversities());
            UniversitiesView = CollectionViewSource.GetDefaultView(Universities);
            UniversitiesView.Filter = FilterUniversity;
            SelectedUniversity = Universities.FirstOrDefault();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        public ObservableCollection<University> Universities { get; }

        public ICollectionView UniversitiesView { get; }

        public University SelectedUniversity
        {
            get => _selectedUniversity;
            set
            {
                if (_selectedUniversity == value)
                {
                    return;
                }

                _selectedUniversity = value;
                OnPropertyChanged();
            }
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (_searchText == value)
                {
                    return;
                }

                _searchText = value;
                OnPropertyChanged();
                UniversitiesView.Refresh();

                if (SelectedUniversity == null || !UniversitiesView.Cast<University>().Contains(SelectedUniversity))
                {
                    SelectedUniversity = UniversitiesView.Cast<University>().FirstOrDefault();
                }
            }
        }

        private bool FilterUniversity(object item)
        {
            if (string.IsNullOrWhiteSpace(SearchText))
            {
                return true;
            }

            var university = item as University;
            if (university == null)
            {
                return false;
            }

            var query = SearchText.Trim();
            return Contains(university.Name, query)
                   || Contains(university.City, query)
                   || Contains(university.Country, query)
                   || university.Faculties.Any(faculty =>
                       Contains(faculty.Name, query)
                       || faculty.Programs.Any(program =>
                           Contains(program.Name, query)
                           || Contains(program.Degree, query)
                           || Contains(program.Language, query)));
        }

        private static bool Contains(string source, string query)
        {
            return source != null && source.IndexOf(query, StringComparison.OrdinalIgnoreCase) >= 0;
        }

        private static University[] CreateUniversities()
        {
            return new[]
            {
                new University
                {
                    Name = "Kyiv Polytechnic Institute",
                    City = "Kyiv",
                    Country = "Ukraine",
                    Founded = 1898,
                    Students = "23,500",
                    Website = "kpi.ua",
                    Campus = "Urban campus with research parks, libraries, laboratories, and student housing.",
                    Accreditation = "National research university",
                    Overview = "A large technical university focused on engineering, computer science, applied physics, and innovation programs.",
                    Faculties =
                    {
                        new Faculty
                        {
                            Name = "Faculty of Informatics and Computer Engineering",
                            Dean = "Prof. Olena Dmytrenko",
                            Summary = "Software systems, computer engineering, data platforms, and embedded solutions.",
                            Programs =
                            {
                                new StudyProgram
                                {
                                    Name = "Software Engineering",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian / English",
                                    Tuition = "State funded and contract",
                                    Summary = "Full-cycle software development, architecture, testing, and cloud deployment."
                                },
                                new StudyProgram
                                {
                                    Name = "Computer Systems and Networks",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian",
                                    Tuition = "State funded and contract",
                                    Summary = "Computer hardware, operating systems, distributed networks, and infrastructure security."
                                }
                            }
                        },
                        new Faculty
                        {
                            Name = "Faculty of Applied Mathematics",
                            Dean = "Prof. Maksym Bondar",
                            Summary = "Mathematical modeling, analytics, optimization, and scientific computing.",
                            Programs =
                            {
                                new StudyProgram
                                {
                                    Name = "Data Science",
                                    Degree = "Master",
                                    Duration = "1.5 years",
                                    Language = "English",
                                    Tuition = "Contract",
                                    Summary = "Machine learning, statistical modeling, visualization, and production data workflows."
                                },
                                new StudyProgram
                                {
                                    Name = "System Analysis",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian",
                                    Tuition = "State funded and contract",
                                    Summary = "Decision science, mathematical programming, simulation, and risk analysis."
                                }
                            }
                        }
                    }
                },
                new University
                {
                    Name = "Lviv National University",
                    City = "Lviv",
                    Country = "Ukraine",
                    Founded = 1661,
                    Students = "19,000",
                    Website = "lnu.edu.ua",
                    Campus = "Historic city campus with modern academic buildings and cultural venues.",
                    Accreditation = "Classical national university",
                    Overview = "A multidisciplinary university with strong humanities, law, economics, natural sciences, and applied technology programs.",
                    Faculties =
                    {
                        new Faculty
                        {
                            Name = "Faculty of International Relations",
                            Dean = "Dr. Roman Koval",
                            Summary = "Diplomacy, regional studies, public policy, and global economics.",
                            Programs =
                            {
                                new StudyProgram
                                {
                                    Name = "International Communications",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian / English",
                                    Tuition = "State funded and contract",
                                    Summary = "Negotiation, public diplomacy, global media, and intercultural project work."
                                },
                                new StudyProgram
                                {
                                    Name = "European Studies",
                                    Degree = "Master",
                                    Duration = "1.5 years",
                                    Language = "English",
                                    Tuition = "Contract",
                                    Summary = "EU institutions, policy analysis, integration processes, and research methods."
                                }
                            }
                        },
                        new Faculty
                        {
                            Name = "Faculty of Electronics and Computer Technologies",
                            Dean = "Prof. Iryna Savchuk",
                            Summary = "Digital systems, applied electronics, cyber-physical systems, and programming.",
                            Programs =
                            {
                                new StudyProgram
                                {
                                    Name = "Cybersecurity",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian",
                                    Tuition = "State funded and contract",
                                    Summary = "Secure systems, network defense, cryptography, and incident response."
                                },
                                new StudyProgram
                                {
                                    Name = "Internet of Things",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian",
                                    Tuition = "Contract",
                                    Summary = "Sensors, embedded programming, communication protocols, and device management."
                                }
                            }
                        }
                    }
                },
                new University
                {
                    Name = "Odesa National Maritime University",
                    City = "Odesa",
                    Country = "Ukraine",
                    Founded = 1930,
                    Students = "7,800",
                    Website = "onmu.org.ua",
                    Campus = "Coastal campus with engineering labs, simulators, and logistics research facilities.",
                    Accreditation = "Specialized maritime university",
                    Overview = "A specialized university for maritime transport, logistics, port engineering, and marine operations.",
                    Faculties =
                    {
                        new Faculty
                        {
                            Name = "Faculty of Transport Technologies and Systems",
                            Dean = "Dr. Serhii Melnyk",
                            Summary = "Maritime logistics, transport systems, port management, and supply chains.",
                            Programs =
                            {
                                new StudyProgram
                                {
                                    Name = "Transport Logistics",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian",
                                    Tuition = "State funded and contract",
                                    Summary = "Cargo planning, transport analytics, terminal operations, and route optimization."
                                },
                                new StudyProgram
                                {
                                    Name = "Port Management",
                                    Degree = "Master",
                                    Duration = "1.5 years",
                                    Language = "English",
                                    Tuition = "Contract",
                                    Summary = "Port economics, safety, maritime law, and infrastructure operations."
                                }
                            }
                        },
                        new Faculty
                        {
                            Name = "Faculty of Marine Engineering",
                            Dean = "Prof. Viktor Hrytsenko",
                            Summary = "Ship systems, marine power plants, maintenance, and technical operations.",
                            Programs =
                            {
                                new StudyProgram
                                {
                                    Name = "Marine Power Plants",
                                    Degree = "Bachelor",
                                    Duration = "4 years",
                                    Language = "Ukrainian",
                                    Tuition = "State funded and contract",
                                    Summary = "Ship engines, diagnostics, automation, and technical safety practices."
                                }
                            }
                        }
                    }
                }
            };
        }

        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class University
    {
        public string Name { get; set; }

        public string City { get; set; }

        public string Country { get; set; }

        public int Founded { get; set; }

        public string Students { get; set; }

        public string Website { get; set; }

        public string Campus { get; set; }

        public string Accreditation { get; set; }

        public string Overview { get; set; }

        public ObservableCollection<Faculty> Faculties { get; } = new ObservableCollection<Faculty>();

        public int FacultyCount => Faculties.Count;

        public int ProgramCount => Faculties.Sum(faculty => faculty.Programs.Count);

        public string Location => $"{City}, {Country}";
    }

    public class Faculty
    {
        public string Name { get; set; }

        public string Dean { get; set; }

        public string Summary { get; set; }

        public ObservableCollection<StudyProgram> Programs { get; } = new ObservableCollection<StudyProgram>();

        public int ProgramCount => Programs.Count;
    }

    public class StudyProgram
    {
        public string Name { get; set; }

        public string Degree { get; set; }

        public string Duration { get; set; }

        public string Language { get; set; }

        public string Tuition { get; set; }

        public string Summary { get; set; }
    }
}
