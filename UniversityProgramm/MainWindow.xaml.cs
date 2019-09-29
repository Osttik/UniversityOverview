using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using Xamarin.Forms.Platform.WPF;

namespace UniversityProgramm
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void Expander_Button_click(object sender, RoutedEventArgs e)
        {
            if (LeftExpandPanel.Visibility == Visibility.Collapsed)
            {
                LeftExpandPanel.Visibility = Visibility.Visible;
                //((Button)sender).Margin = new Thickness(134, 0, 0, 0);
                ((Button)sender).Content = "-->";
            }
            else
            {
                LeftExpandPanel.Visibility = Visibility.Collapsed;
                //((Button)sender).Margin = new Thickness(0, 0, 0, 0);
                //((Button)sender).Margin = new Thickness(134, 0, 0, 0);
                ((Button)sender).Content = "<--";
            }
        }
    }
}
