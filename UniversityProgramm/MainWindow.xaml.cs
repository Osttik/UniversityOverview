using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace UniversityProgramm
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public double MaximumHeight { get => Height; } 

        public MainWindow()
        {
            InitializeComponent();
        }

        //private void Expander_Button_click(object sender, RoutedEventArgs e)
        //{
        //    if (LeftExpandPanel.Visibility == Visibility.Collapsed)
        //    {
        //        LeftExpandPanel.Visibility = Visibility.Visible;
        //        ((Button)sender).Content = "-->";
        //    }
        //    else
        //    {
        //        LeftExpandPanel.Visibility = Visibility.Collapsed;
        //        ((Button)sender).Content = "<--";
        //    }
        //}

        private void Exit(object sender, RoutedEventArgs e)
        {
            Environment.Exit(0);
        }

        public void DrawLine(Point firstPoint, Point secondPoint)
        {
            Line line = new Line();
            line.X1 = firstPoint.X;
            line.X2 = secondPoint.X;
            line.Y1 = firstPoint.Y;
            line.Y2 = secondPoint.Y;

            line.Stroke = Brushes.Blue;
            line.StrokeThickness = 2;
            MainGrid.Children.Add(line);
        }

        private void Find(object sender, RoutedEventArgs e)
        {

        }
    }
}
