using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using System.IO;
using System.Collections.Generic;

namespace UniversityProgramm
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public double MaximumHeight { get => Height; }

        private int _delta = 120;
        private float _persantage = 0.1f;
        private readonly float _minPersantage = 0.6f;
        private readonly float _maxPersantage = 1.5f;
        private float _currentPersantage = 1f;
        private double _normalHeight = 800;
        private double _normalWidth = 1024;
        private Image? _map;

        public MainWindow()
        {
            InitializeComponent();

            var picturePath = "pack://application:,,,/Images/1.1.jpg";

            AddPicture(picturePath);
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
            Line line = new Line
            {
                X1 = firstPoint.X,
                X2 = secondPoint.X,
                Y1 = firstPoint.Y,
                Y2 = secondPoint.Y,
                Stroke = Brushes.Blue,
                StrokeThickness = 2
            };

            Map.Children.Add(line);
        }

        public bool ClearAllLines()
        {
            bool isCLeared = false;

            List<Line> lines = new List<Line>();

            foreach (var item in Map.Children)
            {
                if(item is Line line)
                {
                    lines.Add(line);
                }
            }

            foreach (var item in lines)
            {
                Map.Children.Remove(item);
            }

            return isCLeared;
        }

        private void AddButtonClick(object sender, RoutedEventArgs e)
        {
            var dialog = new Microsoft.Win32.OpenFileDialog
            {
                Filter = "Image Files (*.jpg; *.jpeg; *.gif; *.bmp)|*.jpg; *.jpeg; *.gif; *.bmp"
            };

            if (dialog.ShowDialog() == true)
            {
                AddPicture(dialog.FileName);
            }
        }

        private void AddPicture(string path)
        {
            var bitmap = new BitmapImage(new Uri(path));
            var image = new Image()
            {
                Source = bitmap,
                Width = bitmap.Width,
                Height = bitmap.Height,
                Stretch = Stretch.Fill
            };

            image.Name = "MapPicture";

            _normalHeight = bitmap.Height;
            _normalWidth = bitmap.Width;
            _currentPersantage = 1f;
            _map = image;

            Canvas.SetLeft(image, 0);
            Canvas.SetTop(image, 0);

            canvas.Children.Add(image);
            Dispatcher.BeginInvoke(new Action(ConstrainMapPosition));
        }

        private Image? draggedImage;
        private Point mousePosition;

        private void CanvasMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var image = e.Source as Image;

            if (image != null && canvas.CaptureMouse())
            {
                Mouse.OverrideCursor = Cursors.ScrollAll;
                mousePosition = e.GetPosition(canvas);
                draggedImage = image;
                Panel.SetZIndex(draggedImage, 1);
            }
        }

        private void CanvasMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (draggedImage != null)
            {
                Mouse.OverrideCursor = Cursors.Arrow;
                canvas.ReleaseMouseCapture();
                Panel.SetZIndex(draggedImage, 0);
                draggedImage = null;
            }
        }

        private void CanvasMouseMove(object sender, MouseEventArgs e)
        {
            if (draggedImage != null)
            {
                var position = e.GetPosition(canvas);
                var offset = position - mousePosition;
                mousePosition = position;

                Canvas.SetLeft(draggedImage, GetCanvasLeft(draggedImage) + offset.X);
                Canvas.SetTop(draggedImage, GetCanvasTop(draggedImage) + offset.Y);
                ConstrainMapPosition();
            }
        }

        private void Find(object sender, RoutedEventArgs e)
        {

        }

        private void ToMap(object sender, RoutedEventArgs e)
        {
            ClearAllLines();
        }

        private void CanvasMouseWheel(object sender, MouseWheelEventArgs e)
        {
            if (_map == null)
            {
                foreach (var item in canvas.Children)
                {
                    if (item is Image image && image.Name == "MapPicture")
                    {
                        _map = image;
                        break;
                    }
                }
            }

            if (_map == null)
            {
                return;
            }

            var zoomStep = (e.Delta / _delta) * _persantage;
            var nextPersantage = Math.Max(_minPersantage, Math.Min(_maxPersantage, _currentPersantage + zoomStep));

            if (Math.Abs(nextPersantage - _currentPersantage) < 0.001)
            {
                e.Handled = true;
                return;
            }

            _currentPersantage = nextPersantage;
            _map.Height = _currentPersantage * _normalHeight;
            _map.Width = _currentPersantage * _normalWidth;
            ConstrainMapPosition();
            e.Handled = true;
        }

        private void MapSizeChanged(object sender, SizeChangedEventArgs e)
        {
            canvas.Width = Math.Max(0, e.NewSize.Width);
            canvas.Height = Math.Max(0, e.NewSize.Height);
            ConstrainMapPosition();
        }

        private void ConstrainMapPosition()
        {
            if (_map == null || Map.ActualWidth <= 0 || Map.ActualHeight <= 0)
            {
                return;
            }

            var imageWidth = _map.ActualWidth > 0 ? _map.ActualWidth : _map.Width;
            var imageHeight = _map.ActualHeight > 0 ? _map.ActualHeight : _map.Height;
            var left = GetCanvasLeft(_map);
            var top = GetCanvasTop(_map);

            if (imageWidth <= Map.ActualWidth)
            {
                left = (Map.ActualWidth - imageWidth) / 2;
            }
            else
            {
                left = Math.Min(0, Math.Max(Map.ActualWidth - imageWidth, left));
            }

            if (imageHeight <= Map.ActualHeight)
            {
                top = (Map.ActualHeight - imageHeight) / 2;
            }
            else
            {
                top = Math.Min(0, Math.Max(Map.ActualHeight - imageHeight, top));
            }

            Canvas.SetLeft(_map, left);
            Canvas.SetTop(_map, top);
        }

        private double GetCanvasLeft(UIElement element)
        {
            var left = Canvas.GetLeft(element);
            return double.IsNaN(left) ? 0 : left;
        }

        private double GetCanvasTop(UIElement element)
        {
            var top = Canvas.GetTop(element);
            return double.IsNaN(top) ? 0 : top;
        }
    }
}
